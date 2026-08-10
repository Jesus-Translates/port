import { NextResponse, type NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
import { getDb, units } from "@/lib/db";
import { getSession, roleOf } from "@/lib/auth";
import { generateEuropean } from "@/lib/ai-guard";
import { lintPt } from "@/lib/pt-lint";
import { PT_STYLE, SANDRA } from "@/lib/ai";

export const maxDuration = 300;

/**
 * Write unit Learning Notes in batches, in PRODUCTION.
 *
 * The obvious place for this is a script, and there is one — but a local run
 * has no real model key and falls back to the rate-limited gateway, which 429s
 * a few notes in. Production holds the key, so the work belongs here.
 *
 * Two jobs at once: fill the 120 units that have no note (so nobody waits on a
 * model the first time they open a unit, and every note can be reviewed before
 * a learner sees it), and rewrite the handful that name one family's town —
 * notes are SHARED content, so a learner in Ericeira must not be told about
 * Santa Cruz.
 *
 * Batched and idempotent: call it until it reports nothing left.
 */

const NAMES_A_TOWN = /Santa Cruz|Torres Vedras|Silveira/i;

/**
 * Levels this generator must not write.
 *
 * Cívica teaches Portuguese citizenship law, and content/civica/ holds a
 * hand-researched, fact-checked corpus for it — including nuances a generic
 * model flattens: the CPLP provision is a REBUTTABLE PRESUMPTION on the
 * language half only, the alínea d) proof mechanism is UNSPECIFIED so no
 * single unified exam may be asserted, and applications filed before
 * 19 May 2026 owe no test at all. The implementing decree had still not
 * published as of 2026-08-10.
 *
 * Those notes must be written FROM the corpus, by someone reading it. Not
 * here. Remove this guard only when the regulation is published and the
 * corpus has been updated.
 */
const NEVER_GENERATE = new Set(["Cívica"]);

function needsWork(note: string): "missing" | "town" | "brazilian" | null {
  if (note.trim().length < 200) return "missing";
  if (NAMES_A_TOWN.test(note)) return "town";
  if (lintPt(note).some((f) => f.severity === "high")) return "brazilian";
  return null;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || (await roleOf(session.username)) !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const batch = Math.min(
    12,
    Math.max(1, Number(request.nextUrl.searchParams.get("batch") ?? 6))
  );
  const db = getDb();

  const rows = await db
    .select({
      id: units.id,
      slug: units.slug,
      title: units.title,
      titlePt: units.titlePt,
      cefr: units.cefr,
      note: units.noteMd,
    })
    .from(units)
    .orderBy(sql`${units.cefr}, ${units.sortOrder}`);

  const pending = rows
    .map((r) => ({ ...r, why: needsWork(r.note ?? "") }))
    .filter((r) => r.why !== null && !NEVER_GENERATE.has(r.cefr));

  const slice = pending.slice(0, batch);
  const written: { slug: string; why: string; chars: number; retried: boolean }[] = [];
  const skipped: { slug: string; reason: string }[] = [];

  for (const unit of slice) {
    const existing = unit.note ?? "";
    const fresh = unit.why === "missing";
    const before = lintPt(existing).filter((f) => f.severity === "high");

    try {
      const { text, retried } = await generateEuropean({
        kind: "unit-note",
        username: session.username,
        instructions: `${SANDRA}

You are writing ONE unit's Learning Note for a European Portuguese course. ${PT_STYLE}

PLACE — this note is SHARED by every family using the app:
- Name NO specific town, village or region. Not Santa Cruz, not Torres Vedras, not Lisbon, not Porto.
- Use settings that exist everywhere in Portugal: o mercado, a praia, o café, o autocarro, a farmácia, os vizinhos.

LANGUAGE OF THE NOTE — not negotiable:
- EXPLANATIONS in ENGLISH. The reader is an English speaker who may be at A1; an explanation they cannot read
  teaches nothing.
- EXAMPLES in European Portuguese, in **bold**, with the English immediately after in plain text.
- Section headings in Portuguese, written ONCE with a single "## " — never "## ##".
Do not translate the explanatory prose into Portuguese.

Where you deliberately contrast a Brazilian form with the European one, label it clearly
("No Brasil: … · Em Portugal: …") so a learner can never mistake the Brazilian word for the one to use.`,
        prompt: fresh
          ? `Write the Learning Note for the unit "${unit.title}"${unit.titlePt ? ` (${unit.titlePt})` : ""} at CEFR level ${unit.cefr}.
Three sections: "## O que é" (what this unit is for, 2-3 example sentences), "## Como funciona" (how the grammar or
vocabulary works, with a small table where it helps), "## Erros comuns" (2-3 mistakes an English speaker makes here).
400-700 words. Explanations in English, examples in Portuguese.`
          : `Rewrite this Learning Note for "${unit.title}" at CEFR level ${unit.cefr}.
Keep every teaching point and the same structure. Remove every place name. Fix any Brazilian Portuguese that is not a
labelled contrast. Fix any duplicated "## ##" heading.

--- CURRENT NOTE ---
${existing}`,
      });

      const after = lintPt(text).filter((f) => f.severity === "high");
      if (NAMES_A_TOWN.test(text)) {
        skipped.push({ slug: unit.slug, reason: "still names a town" });
        continue;
      }
      if (!fresh && after.length > before.length) {
        skipped.push({ slug: unit.slug, reason: "more Brazilianisms than before" });
        continue;
      }
      if (text.trim().length < 300) {
        skipped.push({ slug: unit.slug, reason: "too short" });
        continue;
      }

      await db
        .update(units)
        .set({ noteMd: text.replace(/^##\s+##\s+/gm, "## ") })
        .where(eq(units.id, unit.id));
      written.push({
        slug: unit.slug,
        why: unit.why!,
        chars: text.length,
        retried,
      });
    } catch (err) {
      skipped.push({
        slug: unit.slug,
        reason: err instanceof Error ? err.message.slice(0, 120) : "failed",
      });
    }
  }

  return NextResponse.json({
    remaining: pending.length - written.length,
    written,
    skipped,
  });
}
