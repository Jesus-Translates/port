import "dotenv/config";
import { eq, sql } from "drizzle-orm";
import { getDb, units } from "../lib/db";
import { generateEuropean } from "../lib/ai-guard";
import { lintPt } from "../lib/pt-lint";
import { PT_STYLE, SANDRA } from "../lib/ai";

/**
 * Rewrite unit learning notes so they belong to the PRODUCT, not to one family.
 *
 * Notes are shared content: the same rows serve every household. They were
 * written when the app had one family, so they name that family's town — a
 * learner in Ericeira was told "a minha irmã vive perto de Santa Cruz". Per-
 * learner localisation belongs in generated content (homework, stories,
 * conversa), where currentStyle() already applies it. A shared note must be
 * town-neutral.
 *
 * Only touches notes that actually need it, and refuses to save a rewrite that
 * is worse than what it replaced.
 */

const NEEDS = /Santa Cruz|Torres Vedras|Silveira/i;

async function main() {
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
    .from(units);

  // Three reasons to write a note: it names a town, it drifted into Brazilian
  // Portuguese, or it does not exist yet. Pre-generating the missing ones
  // means nobody waits on a model the first time they open a unit, and it lets
  // every note be reviewed BEFORE a learner ever sees it.
  const targets = rows.filter((r) => {
    const note = r.note ?? "";
    if (note.length < 200) return true;
    return NEEDS.test(note) || lintPt(note).length > 0;
  });
  const missing = targets.filter((r) => (r.note ?? "").length < 200).length;
  console.log(
    `${rows.length} units · ${targets.length} to write (${missing} missing, ${targets.length - missing} to fix)`
  );

  // Four at a time: fast enough to finish in minutes, gentle enough not to
  // trip provider rate limits half way through a 120-note run.
  const LANES = 4;
  let done = 0;
  const queue = [...targets];

  async function worker() {
    for (;;) {
      const unit = queue.shift();
      if (!unit) return;
      await one(unit);
      done++;
    }
  }
  await Promise.all(Array.from({ length: LANES }, worker));
  console.log(`\nfinished ${done} notes`);
  process.exit(0);
}

async function one(unit: {
  id: number;
  slug: string;
  title: string;
  titlePt: string | null;
  cefr: string;
  note: string | null;
}) {
  const db = getDb();
  {
    const existing = unit.note ?? "";
    const fresh = existing.length < 200;
    const before = lintPt(existing);

    const { text, retried } = await generateEuropean({
      kind: "unit-note",
      instructions: `${SANDRA}

You are rewriting ONE unit's Learning Note for a European Portuguese course. ${PT_STYLE}

This note is SHARED by every family using the app, so it must be place-neutral:
- Do NOT name any specific town, village or region. No Santa Cruz, no Torres Vedras, no Lisbon, no Porto.
- Write examples that work anywhere in Portugal: o mercado, a praia, o café, o autocarro, a farmácia, os vizinhos.
- "a minha irmã vive perto da praia" — good. "a minha irmã vive perto de Santa Cruz" — wrong, it is not their town.

LANGUAGE OF THE NOTE — this is not negotiable:
- The EXPLANATIONS are written in ENGLISH. The learner is an English speaker who may be at A1; a grammar explanation
  they cannot read teaches nothing.
- The EXAMPLES are in European Portuguese, in **bold**, with the English immediately after in plain text.
- Section headings stay in Portuguese ("## O que é", "## Como funciona", "## Erros comuns").
Do NOT translate the explanatory prose into Portuguese. English explanation, Portuguese examples.

Keep the note's EXISTING structure, teaching point, level and approximate length. This is a rewrite, not a new note.`,
      prompt: fresh
        ? `Write the Learning Note for the unit "${unit.title}"${unit.titlePt ? ` (${unit.titlePt})` : ""} at level ${unit.cefr}.
Sections: "## O que é" (what this unit is for, with 2-3 example sentences), "## Como funciona" (how the grammar or
vocabulary works, with a small table where it helps), "## Erros comuns" (2-3 mistakes an English speaker makes here).
Explanations in ENGLISH, examples in Portuguese in **bold** with the English after. Around 400-700 words.`
        : `Rewrite this Learning Note for the unit "${unit.title}"${unit.titlePt ? ` (${unit.titlePt})` : ""} at level ${unit.cefr}.
Keep every teaching point. Remove every place name. Fix any Brazilian Portuguese.

--- CURRENT NOTE ---
${existing}`,
    });

    const after = lintPt(text);
    const stillTown = NEEDS.test(text);
    // Never accept a rewrite that failed the two jobs it had.
    const worseThanBefore = !fresh && after.length > before.length;
    if (stillTown || worseThanBefore || text.length < 300) {
      console.log(
        `  ✗ ${unit.slug} — ${stillTown ? "still names a town" : worseThanBefore ? "more Brazilianisms than before" : "too short"}`
      );
      return;
    }

    await db.update(units).set({ noteMd: text }).where(eq(units.id, unit.id));
    console.log(
      `  ✓ ${unit.slug} (${unit.cefr}) ${fresh ? "new" : "fixed"} · ${text.length} chars${after.length ? ` · ${after.length} BR left` : ""}${retried ? " · retried" : ""}`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
