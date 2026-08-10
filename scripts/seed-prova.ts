/**
 * Ingests the curated exam question banks from content/civica/banco-*.md
 * (and any future content/ciple/banco-*.md in the same format) into the
 * exam_questions table.
 *
 * The Markdown is the source of truth and stays human — long, cited, meant to
 * be read and corrected by the family. What lands in the database is the
 * parsed question rows, as DRAFTS: nothing is shown to a learner until it is
 * published, because this content is model-written and the whole product's
 * claim is register + factual authenticity.
 *
 * Format (authored to contract by the content agents):
 *   ## Q001 [historia]
 *   **Pergunta:** …
 *   - [ ] option
 *   - [x] the correct option
 *   - [ ] option
 *   - [ ] option
 *   **Explicacao:** …           (also accepts Explicação)
 *   **Fonte:** …
 *
 * Idempotent: a question is matched by (bank, sourceFile, qnum) and updated in
 * place; re-running never duplicates and never flips a published row back to
 * draft.
 *
 * Run: npm run db:prova            — seed/refresh as drafts
 *      npm run db:prova -- --publish   — additionally publish every seeded row
 *        (use only after the fact-check report and a human pass say GO)
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { and, eq } from "drizzle-orm";
import { getDb, examQuestions } from "../lib/db";

const publish = process.argv.includes("--publish");

type Parsed = {
  qnum: string;
  section: string;
  promptPt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source: string;
};

/** Parse one banco file. Throws on malformed questions — a silently skipped
 *  question would read as "covered" when it isn't. */
function parseBank(path: string): Parsed[] {
  const text = readFileSync(path, "utf8");
  const out: Parsed[] = [];
  const blocks = text.split(/^## (?=Q\d)/m).slice(1);
  for (const block of blocks) {
    const head = block.match(/^(Q\d+)\s*\[([a-z-]+)\]/);
    if (!head) throw new Error(`${basename(path)}: bad question header: ${block.slice(0, 60)}`);
    const [, qnum, section] = head;
    const prompt = block.match(/\*\*Pergunta:\*\*\s*([\s\S]*?)\n- \[/);
    const opts = [...block.matchAll(/^- \[([ x])\]\s*(.+)$/gm)];
    const expl = block.match(/\*\*Explica(?:ç|c)(?:ã|a)o:\*\*\s*([\s\S]*?)(?=\n\*\*|\n## |$)/);
    const fonte = block.match(/\*\*Fonte:\*\*\s*(.+)/);
    if (!prompt) throw new Error(`${basename(path)} ${qnum}: no Pergunta`);
    if (opts.length !== 4) throw new Error(`${basename(path)} ${qnum}: ${opts.length} options (need 4)`);
    const correct = opts.findIndex((o) => o[1] === "x");
    if (correct === -1 || opts.filter((o) => o[1] === "x").length !== 1)
      throw new Error(`${basename(path)} ${qnum}: need exactly one [x]`);
    out.push({
      qnum,
      section,
      promptPt: prompt[1].trim(),
      options: opts.map((o) => o[2].trim()),
      correctIndex: correct,
      explanation: expl ? expl[1].trim() : "",
      source: fonte ? fonte[1].trim() : "",
    });
  }
  return out;
}

/** Accent-and-punctuation-blind key, so «18 distritos» asked twice across
 *  banks (fact-QA found 8 byte-identical pairs) seeds only once. */
function dedupeKey(promptPt: string): string {
  return promptPt
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function main() {
  const db = getDb();
  let inserted = 0;
  let updated = 0;
  let deduped = 0;
  const seenPrompts = new Set<string>();

  for (const bank of ["civica", "ciple"]) {
    const dir = join(process.cwd(), "content", bank);
    if (!existsSync(dir)) continue;
    // Sorted so the first-occurrence winner of a duplicate is stable across runs.
    const files = readdirSync(dir)
      .filter((f) => f.startsWith("banco-") && f.endsWith(".md"))
      .sort();
    for (const file of files) {
      let qs: Parsed[];
      try {
        qs = parseBank(join(dir, file));
      } catch (err) {
        console.error(`  ✗ ${file}: ${(err as Error).message}`);
        continue;
      }
      // Files without parseable questions (the CIPLE escrita/oral/escuta banks
      // are freeform coaching material, not MCQ banks) simply contribute none.
      if (qs.length === 0) continue;

      for (const [i, q] of qs.entries()) {
        const pk = dedupeKey(q.promptPt);
        if (seenPrompts.has(pk)) {
          deduped += 1;
          continue;
        }
        seenPrompts.add(pk);
        const key = and(
          eq(examQuestions.bank, bank),
          eq(examQuestions.sourceFile, file),
          eq(examQuestions.qnum, q.qnum)
        );
        const [existing] = await db
          .select({ id: examQuestions.id, status: examQuestions.status })
          .from(examQuestions)
          .where(key)
          .limit(1);
        const row = {
          bank,
          section: q.section,
          qnum: q.qnum,
          sourceFile: file,
          promptPt: q.promptPt,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          source: q.source,
          sortOrder: i,
        };
        if (!existing) {
          await db
            .insert(examQuestions)
            .values({ ...row, status: publish ? "published" : "draft" });
          inserted += 1;
        } else {
          // Never demote published back to draft on a refresh.
          await db
            .update(examQuestions)
            .set(
              publish ? { ...row, status: "published" } : row
            )
            .where(eq(examQuestions.id, existing.id));
          updated += 1;
        }
      }
      console.log(`  ${bank}/${file}: ${qs.length} questions`);
    }
  }
  console.log(
    `\nBanco seeded — ${inserted} inserted, ${updated} refreshed, ${deduped} cross-file duplicates skipped${publish ? ", ALL PUBLISHED" : " (drafts — publish after review)"}.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
