"use server";

import { and, asc, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { GradedResult } from "@/lib/actions/quiz";
import { roleOf, requireSession, requireStaff } from "@/lib/auth";
import { householdUsernames, inMyHousehold } from "@/lib/tenant";
import { logActivity } from "@/lib/data";
import {
  activity,
  aiUsage,
  cards,
  categories,
  getDb,
  homework,
  kudos,
  lessons,
  listeningClips,
  lsSessions,
  missionAttempts,
  missions,
  notes,
  quizzes,
  refEntries,
  reviewLogs,
  stories,
  ttsAudio,
  unitItems,
  unitProgress,
  units,
  users,
} from "@/lib/db";
import {
  type HomeworkItem,
  introBefore,
  parseItemsFromMarkdown,
} from "@/lib/homework-items";
import { countDue } from "@/lib/srs";
import { usdToEur } from "@/lib/usage";

// Everything below is module-LOCAL on purpose: a "use server" file may only
// export async functions (types are erased, so those are fine).

const DEFAULT_LEVEL = "A2";

/** First instant of the current month in the family's timezone. Mirrors the
 *  private helper in lib/usage.ts so the by-kind breakdown on /admin/sistema
 *  and the per-person totals on /gastos always agree about "this month". */
function monthStart(): Date {
  const day = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Lisbon",
  });
  return new Date(`${day.slice(0, 7)}-01T00:00:00Z`);
}

/** Only ever trust a jsonb column to be an array after checking. */
function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/** Both jsonb columns are untyped (`jsonb("items")`, no $type), so their
 *  contents are unchecked. These values get rendered as JSX children — a
 *  non-string slipping in would throw "Objects are not valid as a React
 *  child" and take out the whole learner page, so coerce at the boundary. */
function asText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function isMiss(correct: boolean | null | undefined, verdict?: string | null) {
  // "quase" = right idea, small slips — still something they keep getting
  // wrong, and the grader stores it with correct: true.
  return correct === false || verdict === "errado" || verdict === "quase";
}

/**
 * The error taxonomy behind the per-learner "o que continua a falhar" list.
 * Plain keyword matching, no AI call: the grader writes `tip` in ENGLISH
 * (see FEEDBACK_COACHING in lib/ai.ts), which is what makes this reliable.
 * FIRST MATCH WINS, so the specific rules come before the general ones.
 */
const ERROR_THEMES: {
  id: string;
  label: string;
  /** A ready-made homework topic, in pt-PT, for the one-tap assign button. */
  topic: string;
  test: RegExp;
}[] = [
  {
    id: "estar-a",
    label: "Estar a + infinitivo",
    topic: "estar a + infinitivo para falar do que está a acontecer agora",
    test: /estar a \+|estar a .{0,20}infinit|present continuous/i,
  },
  {
    id: "conjuntivo",
    label: "Conjuntivo",
    topic: "o presente do conjuntivo em pedidos, desejos e dúvidas",
    test: /subjunctive|conjuntivo/i,
  },
  {
    id: "infinitivo",
    label: "Infinitivo depois de outro verbo",
    topic: "o infinitivo depois de poder, querer, ir e gostar de",
    test: /infinitiv/i,
  },
  {
    id: "preposicoes",
    label: "Preposições e contrações",
    topic: "as preposições por, para, a, de, em e as contrações (no, na, ao, à)",
    test: /prepositi|contract(s|ion|ed)?\b|\bpor\b.{0,30}\bpara\b/i,
  },
  {
    id: "passado",
    label: "Passado: perfeito vs. imperfeito",
    topic: "o pretérito perfeito e o pretérito imperfeito no dia a dia",
    test: /imperfeito|pretérito|preterito|completed (past )?action|past description|used to\b|ámos\b/i,
  },
  {
    id: "concordancia",
    label: "Artigos, género e concordância",
    topic: "o género dos nomes e a concordância com o artigo e o adjetivo",
    test: /\barticles?\b|gender|masculine|feminine|concordância|agree(s|ment)?\b/i,
  },
  {
    id: "conjugacao",
    label: "Conjugação: a pessoa certa",
    topic: "conjugar os verbos com tu, nós e eles nas situações do dia a dia",
    test: /match the verb|conjugat|verb (form|ending)|with .?tu.?[,:]|\bnós\b form/i,
  },
  {
    id: "acentos",
    label: "Acentuação",
    topic: "os acentos que mudam o sentido: está/esta, à/a, é/e, pôr/por",
    test: /accent|acentua/i,
  },
  {
    id: "cortesia",
    label: "Registo e cortesia",
    topic: "pedir com cortesia numa loja: queria, se faz favor, por favor",
    test: /polite|politely|\bformal\b|register|\bqueria\b/i,
  },
  {
    id: "ortografia",
    label: "Ortografia e sons",
    topic: "a ortografia dos sons difíceis: lh, nh, ç, ão, s vs. z",
    test: /spell|\bsounds?\b|\blh\b|\bnh\b|silent/i,
  },
  {
    id: "vocabulario",
    label: "Vocabulário e expressões",
    topic: "as palavras e expressões que continuam a escapar",
    test: /\bmeans\b|word for|expression|vocabul/i,
  },
];

const OTHER_THEME = {
  id: "outros",
  label: "Outros pontos",
  topic: "rever os erros mais recentes",
};

/** tip first (it is the portable rule), then the longer feedback prose. */
function classify(tip: string | null, detail: string | null) {
  for (const t of ERROR_THEMES) if (t.test.test(tip ?? "")) return t;
  const both = `${tip ?? ""} ${detail ?? ""}`;
  for (const t of ERROR_THEMES) if (t.test.test(both)) return t;
  return OTHER_THEME;
}

/** Teacher/admin: assign written-by-hand homework to chosen students. */
export async function assignHomework(formData: FormData) {
  const staff = await requireStaff();
  const title = String(formData.get("title") ?? "").trim().slice(0, 200);
  const instructions = String(formData.get("instructions") ?? "")
    .trim()
    .slice(0, 8000);
  // Only people in my own household may be assigned work.
  const household = await householdUsernames();
  const assignees = formData
    .getAll("assignees")
    .map((a) => String(a).toLowerCase())
    .filter((a) => household.includes(a));
  if (!title || !instructions || assignees.length === 0) return;

  const db = getDb();
  // Same per-question treatment students get everywhere else.
  const parsed = parseItemsFromMarkdown(instructions);
  await db.insert(homework).values(
    assignees.map((username) => ({
      username,
      title,
      instructions:
        parsed.length > 0 ? introBefore(instructions) || title : instructions,
      items: parsed.length > 0 ? parsed : null,
      source: "teacher",
    }))
  );
  await logActivity(
    staff.username,
    "homework",
    `${staff.role === "teacher" ? "A professora" : "O admin"} atribuiu “${title}” a ${assignees.length} ${assignees.length === 1 ? "aluno" : "alunos"}`,
    5
  );
  revalidatePath("/homework");
  revalidatePath("/admin");
}

/** Admin: remove any content, regardless of owner. */
export async function adminDeleteContent(
  kind: "homework" | "quiz" | "note" | "kudo",
  id: number
) {
  const session = await requireSession();
  if (await roleOf(session.username) !== "admin") return;
  const db = getDb();
  if (kind === "homework") await db.delete(homework).where(eq(homework.id, id));
  else if (kind === "quiz") await db.delete(quizzes).where(eq(quizzes.id, id));
  else if (kind === "note") await db.delete(notes).where(eq(notes.id, id));
  else if (kind === "kudo") await db.delete(kudos).where(eq(kudos.id, id));
  revalidatePath("/admin");
  revalidatePath("/homework");
  revalidatePath("/familia");
}

/** Admin: wipe the cached audio so a new voice regenerates everything. */
export async function clearTtsCache() {
  const session = await requireSession();
  if (await roleOf(session.username) !== "admin") return;
  const db = getDb();
  await db.delete(ttsAudio);
  revalidatePath("/admin");
}

/** Admin: reset one learner's review deck (fresh start). */
export async function resetDeck(username: string) {
  const session = await requireSession();
  if (await roleOf(session.username) !== "admin") return;
  const u = username.toLowerCase();
  if (!(await inMyHousehold(u))) return;
  const db = getDb();
  await db.delete(cards).where(eq(cards.username, u));
  revalidatePath("/admin");
}

export type StudentStatus = {
  username: string;
  open: number;
  submitted: number;
  reviewed: number;
  /** Stored CEFR level — "A2" is also the fallback, so pair it with `placed`. */
  level: string;
  /** Did they actually take the placement quiz, or is A2 just the default? */
  placed: boolean;
  lastActiveAt: Date | null;
};

/** Teacher/admin: one row per learner for the class table on the hub. */
export async function getClassOverview(): Promise<StudentStatus[]> {
  await requireStaff();
  const db = getDb();
  const roster = await householdUsernames();

  // Grouped queries + Maps, never a correlated sub-select: drizzle renders the
  // outer column unqualified inside a sub-select and it binds to the wrong
  // table, returning zeros without erroring.
  const [rows, levels, lastSeen, placed] = await Promise.all([
    db
      .select({
        username: homework.username,
        status: homework.status,
        n: sql<number>`count(*)::int`,
      })
      .from(homework)
      .where(inArray(homework.username, roster))
      .groupBy(homework.username, homework.status),
    db
      .select({ username: users.username, level: users.cefrLevel })
      .from(users)
      .where(inArray(users.username, roster)),
    db
      .select({
        username: activity.username,
        at: sql<string>`max(${activity.createdAt})`,
      })
      .from(activity)
      .where(inArray(activity.username, roster))
      .groupBy(activity.username),
    // hasBeenPlaced() for the whole class in one round-trip: setCefrLevel
    // leaves this breadcrumb in `activity`, there is no column for it.
    db
      .select({ username: activity.username })
      .from(activity)
      .where(
        and(
          inArray(activity.username, roster),
          sql`${activity.summary} like 'Nível definido%'`
        )
      )
      .groupBy(activity.username),
  ]);

  const levelBy = new Map(levels.map((r) => [r.username, r.level]));
  const seenBy = new Map(lastSeen.map((r) => [r.username, r.at]));
  const placedSet = new Set(placed.map((r) => r.username));

  return roster.map((u) => {
    const mine = rows.filter((r) => r.username === u);
    const count = (s: string) =>
      Number(mine.find((r) => r.status === s)?.n ?? 0);
    const at = seenBy.get(u);
    return {
      username: u,
      open: count("open"),
      submitted: count("submitted"),
      reviewed: count("reviewed"),
      level: levelBy.get(u) ?? DEFAULT_LEVEL,
      placed: placedSet.has(u),
      lastActiveAt: at ? new Date(at) : null,
    };
  });
}

/* ------------------------------------------------------------------ *
 * The portal hub
 * ------------------------------------------------------------------ */

export type HubStats = {
  activeThisWeek: number;
  learners: number;
  awaitingCorrection: number;
  unitsPublished: number;
  unitsDraft: number;
};

/** Teacher/admin: the headline numbers at the top of /admin. */
export async function getHubStats(): Promise<HubStats> {
  await requireStaff();
  const db = getDb();
  const roster = await householdUsernames();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [active, hwByStatus, unitsByStatus] = await Promise.all([
    db
      .select({ username: activity.username })
      .from(activity)
      .where(
        and(
          inArray(activity.username, roster),
          gte(activity.createdAt, weekAgo)
        )
      )
      .groupBy(activity.username),
    db
      .select({ status: homework.status, n: sql<number>`count(*)::int` })
      .from(homework)
      .where(inArray(homework.username, roster))
      .groupBy(homework.status),
    db
      .select({ status: units.status, n: sql<number>`count(*)::int` })
      .from(units)
      .groupBy(units.status),
  ]);

  const hwBy = new Map(hwByStatus.map((r) => [r.status, Number(r.n)]));
  const unitBy = new Map(unitsByStatus.map((r) => [r.status, Number(r.n)]));

  return {
    activeThisWeek: active.length,
    learners: roster.length,
    awaitingCorrection: hwBy.get("submitted") ?? 0,
    unitsPublished: unitBy.get("published") ?? 0,
    unitsDraft: unitBy.get("draft") ?? 0,
  };
}

export type SpendByKind = { kind: string; calls: number; eur: number };

/** ADMIN ONLY: what the AI actually cost this month, split by what it was
 *  spent on. ai_usage.kind is recorded on every call and shown nowhere else. */
export async function getMonthSpendByKind(): Promise<SpendByKind[]> {
  const staff = await requireStaff();
  if (staff.role !== "admin") return [];

  const rows = await getDb()
    .select({
      kind: aiUsage.kind,
      calls: sql<number>`count(*)::int`,
      micro: sql<number>`coalesce(sum(${aiUsage.costMicroUsd}), 0)::bigint`,
    })
    .from(aiUsage)
    .where(gte(aiUsage.createdAt, monthStart()))
    .groupBy(aiUsage.kind)
    .orderBy(desc(sql`sum(${aiUsage.costMicroUsd})`));

  const rate = usdToEur();
  return rows.map((r) => ({
    kind: r.kind,
    calls: Number(r.calls),
    eur: (Number(r.micro) / 1_000_000) * rate,
  }));
}

/* ------------------------------------------------------------------ *
 * One learner, in depth
 * ------------------------------------------------------------------ */

export type ErrorPattern = {
  id: string;
  label: string;
  topic: string;
  count: number;
  lastAt: Date;
  examples: {
    source: "tpc" | "teste";
    ref: number;
    title: string;
    corrected: string | null;
    tip: string | null;
  }[];
};

export type LearnerDetail = {
  username: string;
  level: string;
  placed: boolean;
  course: { done: number; withItems: number; total: number };
  deck: {
    total: number;
    due: number;
    mistakeUnseen: number;
    reviews: number;
    passRate: number | null;
  };
  activity: {
    id: number;
    kind: string;
    summary: string;
    xp: number;
    createdAt: Date;
  }[];
  homework: {
    id: number;
    title: string;
    status: string;
    createdAt: Date;
  }[];
  quizzes: {
    id: number;
    topic: string;
    score: number | null;
    total: number | null;
    status: string;
    createdAt: Date;
  }[];
  patterns: ErrorPattern[];
};

/**
 * Teacher/admin: everything worth knowing about ONE learner.
 *
 * `username` is a LOOKUP KEY, never the basis for authorisation — that comes
 * from requireStaff() on the session. It is checked against the roster so this
 * endpoint cannot be used to enumerate arbitrary rows; anything else is null.
 */
export async function getLearnerDetail(
  username: string
): Promise<LearnerDetail | null> {
  await requireStaff();
  const who = String(username ?? "").toLowerCase();
  if (!(await inMyHousehold(who))) return null;

  const db = getDb();

  const [levelRow, placedRow] = await Promise.all([
    db
      .select({ level: users.cefrLevel })
      .from(users)
      .where(eq(users.username, who))
      .limit(1),
    db
      .select({ id: activity.id })
      .from(activity)
      .where(
        and(
          eq(activity.username, who),
          sql`${activity.summary} like 'Nível definido%'`
        )
      )
      .limit(1),
  ]);
  const level = levelRow[0]?.level ?? DEFAULT_LEVEL;

  // Course progress is scoped to the units at THEIR level, published only —
  // a draft is invisible to them, so counting it would be a lie.
  const levelUnits = await db
    .select({ id: units.id })
    .from(units)
    .where(and(eq(units.cefr, level), eq(units.status, "published")));
  const unitIds = levelUnits.map((u) => u.id);

  const [itemTotals, itemDones] =
    unitIds.length === 0
      ? [[], []]
      : await Promise.all([
          db
            .select({
              unitId: unitItems.unitId,
              n: sql<number>`count(*)::int`,
            })
            .from(unitItems)
            .where(inArray(unitItems.unitId, unitIds))
            .groupBy(unitItems.unitId),
          db
            .select({
              unitId: unitProgress.unitId,
              n: sql<number>`count(distinct ${unitProgress.itemId})::int`,
            })
            .from(unitProgress)
            .where(
              and(
                eq(unitProgress.username, who),
                inArray(unitProgress.unitId, unitIds)
              )
            )
            .groupBy(unitProgress.unitId),
        ]);

  const totalBy = new Map(itemTotals.map((r) => [r.unitId, Number(r.n)]));
  const doneBy = new Map(itemDones.map((r) => [r.unitId, Number(r.n)]));
  let unitsDone = 0;
  for (const [unitId, total] of totalBy) {
    if (total > 0 && (doneBy.get(unitId) ?? 0) >= total) unitsDone += 1;
  }

  const [cardRows, dueNow, logRow, activityRows, hwRows, quizRows] =
    await Promise.all([
      db
        .select({
          kind: cards.kind,
          state: cards.state,
          n: sql<number>`count(*)::int`,
        })
        .from(cards)
        .where(eq(cards.username, who))
        .groupBy(cards.kind, cards.state),
      // The canonical definition of "due", not a re-implementation: a card is
      // due for REVIEW only once it has been seen (state > 0). Counting
      // state 0 here would double-count the unseen cards reported separately
      // as `mistakeUnseen` and overstate the learner's backlog.
      countDue(who),
      db
        .select({
          total: sql<number>`count(*)::int`,
          passed: sql<number>`count(*) filter (where ${reviewLogs.rating} >= 3)::int`,
        })
        .from(reviewLogs)
        .where(eq(reviewLogs.username, who)),
      db
        .select({
          id: activity.id,
          kind: activity.kind,
          summary: activity.summary,
          xp: activity.xp,
          createdAt: activity.createdAt,
        })
        .from(activity)
        .where(eq(activity.username, who))
        .orderBy(desc(activity.createdAt))
        .limit(20),
      db
        .select({
          id: homework.id,
          title: homework.title,
          status: homework.status,
          items: homework.items,
          createdAt: homework.createdAt,
        })
        .from(homework)
        .where(eq(homework.username, who))
        .orderBy(desc(homework.createdAt))
        .limit(40),
      db
        .select({
          id: quizzes.id,
          topic: quizzes.topic,
          score: quizzes.score,
          total: quizzes.total,
          status: quizzes.status,
          feedback: quizzes.feedback,
          createdAt: quizzes.createdAt,
        })
        .from(quizzes)
        .where(eq(quizzes.username, who))
        .orderBy(desc(quizzes.createdAt))
        .limit(40),
    ]);

  const cardTotal = cardRows.reduce((s, r) => s + Number(r.n), 0);
  const mistakeUnseen = cardRows
    .filter((r) => r.kind === "mistake" && r.state === 0)
    .reduce((s, r) => s + Number(r.n), 0);
  const reviews = Number(logRow[0]?.total ?? 0);
  const passed = Number(logRow[0]?.passed ?? 0);

  /* --- the error patterns -------------------------------------------
   * Both jsonb columns store an array of graded answers. Homework items are
   * HomeworkItem (feedbackMd + correctedPt + tip); quiz feedback is
   * GradedResult (comment + correctedPt + tip) — different field name for the
   * prose, same idea. We take every answer the grader marked "errado" or
   * "quase" that produced a correction or a rule, bucket it by theme with
   * plain keyword matching, and count. No AI call.                      */
  const misses: {
    themeId: string;
    label: string;
    topic: string;
    at: Date;
    example: ErrorPattern["examples"][number];
  }[] = [];

  for (const hw of hwRows) {
    for (const it of asArray<HomeworkItem>(hw.items)) {
      if (!isMiss(it.correct, it.verdict)) continue;
      if (!it.correctedPt && !it.tip) continue;
      const theme = classify(it.tip ?? null, it.feedbackMd);
      misses.push({
        themeId: theme.id,
        label: theme.label,
        topic: theme.topic,
        at: hw.createdAt,
        example: {
          source: "tpc",
          ref: hw.id,
          title: hw.title,
          corrected: asText(it.correctedPt),
          tip: asText(it.tip),
        },
      });
    }
  }

  for (const q of quizRows) {
    for (const f of asArray<GradedResult>(q.feedback)) {
      if (!isMiss(f.correct, f.verdict)) continue;
      if (!f.correctedPt && !f.tip) continue;
      const theme = classify(f.tip ?? null, f.comment ?? null);
      misses.push({
        themeId: theme.id,
        label: theme.label,
        topic: theme.topic,
        at: q.createdAt,
        example: {
          source: "teste",
          ref: q.id,
          title: q.topic,
          corrected: asText(f.correctedPt),
          tip: asText(f.tip),
        },
      });
    }
  }

  const byTheme = new Map<string, ErrorPattern>();
  for (const m of misses) {
    const found = byTheme.get(m.themeId);
    if (found) {
      found.count += 1;
      if (m.at > found.lastAt) found.lastAt = m.at;
      if (found.examples.length < 3) found.examples.push(m.example);
    } else {
      byTheme.set(m.themeId, {
        id: m.themeId,
        label: m.label,
        topic: m.topic,
        count: 1,
        lastAt: m.at,
        examples: [m.example],
      });
    }
  }
  // Most-repeated first, then most recent. Capped: the section answers "what
  // does this person KEEP getting wrong", and a tail of one-off slips buries
  // the two or three themes actually worth setting homework on.
  const patterns = [...byTheme.values()]
    .sort((a, b) => b.count - a.count || b.lastAt.getTime() - a.lastAt.getTime())
    .slice(0, 6);

  return {
    username: who,
    level,
    placed: Boolean(placedRow[0]),
    course: {
      done: unitsDone,
      withItems: totalBy.size,
      total: unitIds.length,
    },
    deck: {
      total: cardTotal,
      due: dueNow,
      mistakeUnseen,
      reviews,
      passRate: reviews > 0 ? Math.round((passed / reviews) * 100) : null,
    },
    activity: activityRows,
    homework: hwRows.map((h) => ({
      id: h.id,
      title: h.title,
      status: h.status,
      createdAt: h.createdAt,
    })),
    quizzes: quizRows.map((q) => ({
      id: q.id,
      topic: q.topic,
      score: q.score,
      total: q.total,
      status: q.status,
      createdAt: q.createdAt,
    })),
    patterns,
  };
}

/* ------------------------------------------------------------------ *
 * Content
 * ------------------------------------------------------------------ */

export type ContentUnit = {
  id: number;
  slug: string;
  title: string;
  titlePt: string;
  cefr: string;
  status: string;
  items: number;
  hasNote: boolean;
};

export type ContentOverview = {
  units: ContentUnit[];
  clips: { id: number; title: string; cefr: string; source: string }[];
  stories: {
    id: number;
    seriesTitle: string;
    chapter: number;
    title: string;
    level: string;
  }[];
  categories: { id: number; slug: string; namePt: string; entries: number }[];
};

/** Teacher/admin: the whole content library, with the gaps visible. */
export async function getContentOverview(): Promise<ContentOverview> {
  await requireStaff();
  const db = getDb();

  const [unitRows, itemCounts, clipRows, storyRows, catRows, entryCounts] =
    await Promise.all([
      db
        .select({
          id: units.id,
          slug: units.slug,
          title: units.title,
          titlePt: units.titlePt,
          cefr: units.cefr,
          status: units.status,
          noteMd: units.noteMd,
        })
        .from(units)
        .orderBy(asc(units.sortOrder), asc(units.id)),
      db
        .select({ unitId: unitItems.unitId, n: sql<number>`count(*)::int` })
        .from(unitItems)
        .groupBy(unitItems.unitId),
      db
        .select({
          id: listeningClips.id,
          title: listeningClips.title,
          cefr: listeningClips.cefr,
          source: listeningClips.source,
        })
        .from(listeningClips)
        .orderBy(desc(listeningClips.id)),
      db
        .select({
          id: stories.id,
          seriesTitle: stories.seriesTitle,
          chapter: stories.chapter,
          title: stories.title,
          level: stories.level,
        })
        .from(stories)
        .orderBy(asc(stories.seriesTitle), asc(stories.chapter)),
      db
        .select({
          id: categories.id,
          slug: categories.slug,
          namePt: categories.namePt,
        })
        .from(categories)
        .orderBy(asc(categories.sortOrder), asc(categories.id)),
      db
        .select({
          categoryId: refEntries.categoryId,
          n: sql<number>`count(*)::int`,
        })
        .from(refEntries)
        .groupBy(refEntries.categoryId),
    ]);

  const itemsBy = new Map(itemCounts.map((r) => [r.unitId, Number(r.n)]));
  const entriesBy = new Map(entryCounts.map((r) => [r.categoryId, Number(r.n)]));

  return {
    units: unitRows.map((u) => ({
      id: u.id,
      slug: u.slug,
      title: u.title,
      titlePt: u.titlePt,
      cefr: u.cefr,
      status: u.status,
      items: itemsBy.get(u.id) ?? 0,
      hasNote: u.noteMd.trim().length > 0,
    })),
    clips: clipRows,
    stories: storyRows,
    categories: catRows.map((c) => ({
      ...c,
      entries: entriesBy.get(c.id) ?? 0,
    })),
  };
}

/* ------------------------------------------------------------------ *
 * System
 * ------------------------------------------------------------------ */

export type SystemStats = {
  tts: { rows: number; b64Bytes: number };
  /** Every base64 blob we keep in Postgres — the thing that fills the tier. */
  audio: { ttsB64: number; clipsB64: number; lsB64: number; totalB64: number };
  tables: { name: string; rows: number }[];
};

/** ADMIN ONLY: what the deployment looks like from the inside. */
export async function getSystemStats(): Promise<SystemStats | null> {
  const staff = await requireStaff();
  if (staff.role !== "admin") return null;
  const db = getDb();

  const n = sql<number>`count(*)::int`;
  const [
    ttsRow,
    clipRow,
    lsRow,
    usersN,
    activityN,
    cardsN,
    logsN,
    hwN,
    quizN,
    unitsN,
    unitItemsN,
    progressN,
    entriesN,
    catsN,
    usageN,
    missionsN,
    attemptsN,
    kudosN,
    notesN,
    lessonsN,
    storiesN,
  ] = await Promise.all([
    db
      .select({
        rows: n,
        b64: sql<number>`coalesce(sum(length(${ttsAudio.audioB64})), 0)::bigint`,
      })
      .from(ttsAudio),
    db
      .select({
        rows: n,
        b64: sql<number>`coalesce(sum(length(${listeningClips.audioB64})), 0)::bigint`,
      })
      .from(listeningClips),
    db
      .select({
        rows: n,
        b64: sql<number>`coalesce(sum(length(${lsSessions.audioB64})), 0)::bigint`,
      })
      .from(lsSessions),
    db.select({ n }).from(users),
    db.select({ n }).from(activity),
    db.select({ n }).from(cards),
    db.select({ n }).from(reviewLogs),
    db.select({ n }).from(homework),
    db.select({ n }).from(quizzes),
    db.select({ n }).from(units),
    db.select({ n }).from(unitItems),
    db.select({ n }).from(unitProgress),
    db.select({ n }).from(refEntries),
    db.select({ n }).from(categories),
    db.select({ n }).from(aiUsage),
    db.select({ n }).from(missions),
    db.select({ n }).from(missionAttempts),
    db.select({ n }).from(kudos),
    db.select({ n }).from(notes),
    db.select({ n }).from(lessons),
    db.select({ n }).from(stories),
  ]);

  const ttsB64 = Number(ttsRow[0]?.b64 ?? 0);
  const clipsB64 = Number(clipRow[0]?.b64 ?? 0);
  const lsB64 = Number(lsRow[0]?.b64 ?? 0);
  const one = (r: { n: number }[]) => Number(r[0]?.n ?? 0);

  return {
    tts: { rows: Number(ttsRow[0]?.rows ?? 0), b64Bytes: ttsB64 },
    audio: {
      ttsB64,
      clipsB64,
      lsB64,
      totalB64: ttsB64 + clipsB64 + lsB64,
    },
    tables: [
      { name: "users", rows: one(usersN) },
      { name: "activity", rows: one(activityN) },
      { name: "ai_usage", rows: one(usageN) },
      { name: "cards", rows: one(cardsN) },
      { name: "review_logs", rows: one(logsN) },
      { name: "homework", rows: one(hwN) },
      { name: "quizzes", rows: one(quizN) },
      { name: "units", rows: one(unitsN) },
      { name: "unit_items", rows: one(unitItemsN) },
      { name: "unit_progress", rows: one(progressN) },
      { name: "ref_entries", rows: one(entriesN) },
      { name: "categories", rows: one(catsN) },
      { name: "stories", rows: one(storiesN) },
      { name: "listening_clips", rows: Number(clipRow[0]?.rows ?? 0) },
      { name: "tts_audio", rows: Number(ttsRow[0]?.rows ?? 0) },
      { name: "ls_sessions", rows: Number(lsRow[0]?.rows ?? 0) },
      { name: "missions", rows: one(missionsN) },
      { name: "mission_attempts", rows: one(attemptsN) },
      { name: "lessons", rows: one(lessonsN) },
      { name: "notes", rows: one(notesN) },
      { name: "kudos", rows: one(kudosN) },
    ],
  };
}
