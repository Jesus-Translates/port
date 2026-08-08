import Link from "next/link";
import { and, desc, eq, sql } from "drizzle-orm";
import { FalarModes } from "@/components/falar-modes";
import { UnitReturn } from "@/components/unit-return";
import { requireSession } from "@/lib/auth";
import { cards, getDb, homework, refEntries } from "@/lib/db";
import type { HomeworkItem } from "@/lib/homework-items";
import { unitContextFrom } from "@/lib/unit-context";

export const metadata = { title: "Falar" };

function one(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : (v ?? "")).trim();
}

const GENERIC_QUESTIONS = [
  {
    titlePt: "Apresenta-te",
    pt: "Fala de ti: como te chamas, de onde és, onde moras e o que gostas de fazer.",
    en: "Introduce yourself: name, where you're from, where you live, what you enjoy.",
  },
  {
    titlePt: "O teu dia",
    pt: "Conta como foi o teu dia de ontem, do pequeno-almoço até à noite.",
    en: "Describe your day yesterday, from breakfast to night.",
  },
  {
    titlePt: "No café",
    pt: "Imagina que estás num café em Santa Cruz. O que pedes e porquê?",
    en: "You're at a café in Santa Cruz. What do you order and why?",
  },
];

export default async function FalarPage(props: PageProps<"/practice/falar">) {
  const session = await requireSession();
  const sp = await props.searchParams;
  const unit = await unitContextFrom(sp);
  // An explicit topic beats the learner's TPC: a unit step that says "falar
  // sobre o talho" must not open on last week's homework questions. With no
  // topic configured, the unit's own name is still better than nothing.
  const tema = one(sp.tema).slice(0, 200) || unit?.titlePt.trim() || "";
  const db = getDb();

  // Everything spoken here derives from the learner's own TPC: their homework
  // questions become oral prompts, and their corrected mistakes become the
  // read-aloud targets. The phrasebook only fills gaps.
  const hws = await db
    .select({
      id: homework.id,
      title: homework.title,
      items: homework.items,
    })
    .from(homework)
    .where(eq(homework.username, session.username))
    .orderBy(desc(homework.createdAt))
    .limit(10);

  const items = hws.flatMap((h) =>
    ((h.items as HomeworkItem[] | null) ?? []).map((i) => ({
      ...i,
      hwTitle: h.title,
    }))
  );

  // Responder: pt-questions straight from their assignments (open ones =
  // rehearse before writing; graded ones = re-practise out loud).
  const tpcQuestions = items
    .filter((i) => i.prompt.trim().endsWith("?"))
    .slice(0, 4)
    .map((i) => ({
      titlePt: `Do teu TPC: ${i.hwTitle.slice(0, 48)}`,
      pt: i.prompt,
      en: i.hint ?? "Answer out loud, in Portuguese.",
    }));
  // The unit's topic goes first and needs no AI call, so the learner lands on
  // something to say about the right thing even before Luna is asked.
  const topicQuestions = tema
    ? [
        {
          titlePt: `Tema da unidade: ${tema.slice(0, 48)}`,
          pt: `Conta-me tudo sobre ${tema} — o que vês, o que dizes e o que pedes.`,
          en: "Your unit's topic — say as much as you can, out loud.",
        },
      ]
    : [];
  const starterQuestions = [
    ...topicQuestions,
    ...tpcQuestions,
    ...GENERIC_QUESTIONS.slice(
      0,
      Math.max(0, 3 - topicQuestions.length - tpcQuestions.length)
    ),
  ];

  // Ler: the corrected sentences from their own errors — homework first,
  // then mistake cards (quiz/ditado/verb misses), phrasebook as filler.
  const hwCorrections = items
    .filter((i) => i.correctedPt && i.correct !== null)
    .slice(0, 3)
    .map((i, k) => ({
      key: `hw-${k}`,
      pt: i.correctedPt as string,
      en: i.prompt.slice(0, 90),
      source: `Erraste no TPC «${i.hwTitle.slice(0, 40)}» — agora di-lo bem`,
    }));

  const mistakeCards =
    hwCorrections.length < 3
      ? await db
          .select({ id: cards.id, front: cards.front, back: cards.back })
          .from(cards)
          .where(
            and(eq(cards.username, session.username), eq(cards.kind, "mistake"))
          )
          .orderBy(desc(cards.createdAt))
          .limit(3 - hwCorrections.length)
      : [];
  const cardTargets = mistakeCards.map((c) => ({
    key: `card-${c.id}`,
    pt: c.back,
    en: c.front.slice(0, 90),
    source: "Do teu baralho de erros",
  }));

  const fillCount = Math.max(0, 3 - hwCorrections.length - cardTargets.length);
  const fillers =
    fillCount > 0
      ? await db
          .select({ id: refEntries.id, pt: refEntries.pt, en: refEntries.en })
          .from(refEntries)
          .where(
            sql`${refEntries.kind} = 'phrase' and length(${refEntries.pt}) between 15 and 80`
          )
          .orderBy(sql`random()`)
          .limit(fillCount)
      : [];
  const readAloud = [
    ...hwCorrections,
    ...cardTargets,
    ...fillers.map((e) => ({
      key: `ref-${e.id}`,
      pt: e.pt,
      en: e.en,
      source: undefined as string | undefined,
    })),
  ];

  return (
    <div className="space-y-6">
      <UnitReturn unit={unit} />

      <header>
        <Link href="/practice" className="text-xs text-ink-faint hover:text-olive">
          ← Praticar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">🎙️ Falar</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {tema ? (
            <>
              Fala sobre <strong className="text-ink">«{tema}»</strong> — o tema
              desta unidade.{" "}
              <span className="text-ink-faint">
                Answer out loud, or read the sentences and get a pronunciation
                score.
              </span>
            </>
          ) : (
            <>
              Built from your own TPC: answer your homework questions out loud,
              and re-say the sentences you once got wrong — this time perfectly.
            </>
          )}
        </p>
      </header>

      <FalarModes
        readAloud={readAloud}
        starterQuestions={starterQuestions}
        initialTopic={tema}
        unit={unit}
      />
    </div>
  );
}
