import { generateText, NoObjectGeneratedError, Output } from "ai";
import { inArray } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getModel } from "@/lib/ai";
import { currentStyle } from "@/lib/place";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { categories, getDb, refEntries } from "@/lib/db";
import { aiRateLimited, modelId, recordUsage } from "@/lib/usage";

export const maxDuration = 120;

/**
 * Ingest anything into O Livro: paste words/phrases/notes, or upload a file
 * (.txt/.md/.csv/.pdf). Luna turns the raw content into proper pt-PT
 * phrasebook entries and files each one under the best existing category.
 * Duplicates (same pt already in that category) are skipped, not overwritten.
 */

const MAX_TEXT = 20000;
const MAX_FILE = 10 * 1024 * 1024;
const KINDS = ["term", "verb", "phrase", "task"];

const ingestSchema = z.object({
  entries: z
    .array(
      z.object({
        categorySlug: z
          .string()
          .describe("EXACTLY one of the category slugs listed in the prompt."),
        kind: z.string().describe("One of: term, verb, phrase, task"),
        section: z
          .string()
          .describe("Short section heading inside the category, e.g. 'Geral'."),
        pt: z
          .string()
          .describe("The corrected European Portuguese form (nouns with article)."),
        en: z.string().describe("Natural English gloss."),
        note: z
          .string()
          .nullable()
          .describe("Optional short usage tip or pt-PT vs pt-BR note."),
      })
    )
    .min(1)
    .max(40),
});

type IngestEntry = z.infer<typeof ingestSchema>["entries"][number];

function normalizePt(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Some gateway models return near-miss JSON instead of the strict shape. */
function salvageEntries(err: unknown): IngestEntry[] | null {
  if (!NoObjectGeneratedError.isInstance(err) || !err.text) return null;
  try {
    const raw = JSON.parse(err.text) as unknown;
    const list = Array.isArray(raw)
      ? raw
      : typeof raw === "object" && raw !== null && Array.isArray((raw as { entries?: unknown }).entries)
        ? (raw as { entries: unknown[] }).entries
        : null;
    if (!list) return null;
    const parsed = z.array(ingestSchema.shape.entries.element.partial()).safeParse(list);
    if (!parsed.success) return null;
    return parsed.data
      .filter((e): e is IngestEntry & { note: string | null } =>
        Boolean(e.categorySlug && e.pt && e.en)
      )
      .map((e) => ({
        categorySlug: e.categorySlug,
        kind: e.kind ?? "term",
        section: e.section ?? "Geral",
        pt: e.pt,
        en: e.en,
        note: e.note ?? null,
      }));
  } catch {
    return null;
  }
}

async function extractText(file: File): Promise<string | null> {
  const name = file.name.toLowerCase();
  const isPdf = name.endsWith(".pdf") || file.type === "application/pdf";
  if (isPdf) {
    try {
      const { extractText: extract, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(new Uint8Array(await file.arrayBuffer()));
      const { text } = await extract(pdf, { mergePages: true });
      return text;
    } catch {
      return null;
    }
  }
  if (/\.(txt|md|markdown|csv|tsv)$/.test(name) || file.type.startsWith("text/")) {
    return await file.text();
  }
  return null;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (await aiRateLimited(session.username)) {
    return NextResponse.json(
      { error: "Calma! Muitos pedidos à Luna — espera uns minutos." },
      { status: 429 }
    );
  }

  // Gather the raw text: pasted (JSON) or uploaded (multipart).
  let raw = "";
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    const pasted = String(form.get("text") ?? "");
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_FILE) {
        return NextResponse.json(
          { error: "Ficheiro demasiado grande (máx. 10 MB)." },
          { status: 413 }
        );
      }
      const extracted = await extractText(file);
      if (extracted === null) {
        return NextResponse.json(
          { error: "Formato não suportado — usa .txt, .md, .csv ou .pdf." },
          { status: 415 }
        );
      }
      raw = extracted;
    }
    if (pasted.trim()) raw = `${raw}\n${pasted}`.trim();
  } else {
    try {
      const body = await request.json();
      raw = String(body.text ?? "");
    } catch {
      return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
    }
  }
  raw = raw.replace(/\s+\n/g, "\n").trim();
  if (raw.length < 2) {
    return NextResponse.json(
      { error: "Não há nada para ingerir — escreve ou anexa alguma coisa." },
      { status: 400 }
    );
  }
  const truncated = raw.length > MAX_TEXT;
  raw = raw.slice(0, MAX_TEXT);

  const db = getDb();
  const cats = await db
    .select({ id: categories.id, slug: categories.slug, namePt: categories.namePt, nameEn: categories.nameEn })
    .from(categories);
  if (cats.length === 0) {
    return NextResponse.json({ error: "O livro ainda não tem categorias." }, { status: 400 });
  }
  const catBySlug = new Map(cats.map((c) => [c.slug, c]));
  const menu = cats.map((c) => `${c.slug} (${c.namePt} / ${c.nameEn})`).join(", ");

  const args = {
    model: getModel(),
    instructions: `You file new content into a family's European Portuguese phrasebook. ${await currentStyle()}
The raw content may be messy: a word list, class notes, a worksheet, mixed English/Portuguese, even Brazilian forms.
For each genuinely useful vocabulary item or phrase you find, produce ONE entry:
- pt: the CORRECT pt-PT form — fix errors, convert Brazilian to European forms, give nouns their article (a toalha), verbs as infinitive, phrases as natural sentences.
- en: natural English gloss. If the source item was English, translate it INTO pt-PT.
- categorySlug: the best fit among EXACTLY these existing categories: ${menu}. Never invent a slug.
- kind: term (noun), verb, phrase (sentence), or task (household to-do).
- section: a short heading inside the category ("Geral" when unsure).
- note: only when a short usage tip genuinely helps (gender trap, pt-PT vs pt-BR, false friend).
Skip junk: page numbers, headers, instructions to students, anything that is not learnable content.
Cap at 40 entries — prefer the most useful.`,
    prompt: `RAW CONTENT TO INGEST:\n${raw}`,
  };

  let entries: IngestEntry[];
  try {
    const res = await generateText({
      ...args,
      output: Output.object({ schema: ingestSchema }),
    });
    await recordUsage(session.username, "reference", modelId(), res.usage);
    entries = res.output.entries;
  } catch (err) {
    const saved = salvageEntries(err);
    if (!saved || saved.length === 0) {
      console.error("ingest generation failed:", err);
      return NextResponse.json(
        { error: "A Luna não conseguiu processar isto. Tenta outra vez." },
        { status: 502 }
      );
    }
    entries = saved;
    await recordUsage(session.username, "reference", modelId(), {
      inputTokens: Math.ceil(raw.length / 4),
      outputTokens: Math.ceil(JSON.stringify(saved).length / 4),
    });
  }

  // Validate categories + dedupe against what those categories already hold.
  const wanted = entries
    .map((e) => ({
      ...e,
      kind: KINDS.includes(e.kind?.toLowerCase()) ? e.kind.toLowerCase() : "term",
      section: (e.section || "Geral").slice(0, 80),
      pt: e.pt.trim().slice(0, 300),
      en: e.en.trim().slice(0, 300),
      note: e.note?.trim().slice(0, 400) || null,
      cat: catBySlug.get(e.categorySlug),
    }))
    .filter((e) => e.pt && e.en && e.cat);

  const catIds = [...new Set(wanted.map((e) => e.cat!.id))];
  const existing = catIds.length
    ? await db
        .select({ categoryId: refEntries.categoryId, pt: refEntries.pt })
        .from(refEntries)
        .where(inArray(refEntries.categoryId, catIds))
    : [];
  const taken = new Set(existing.map((e) => `${e.categoryId}|${normalizePt(e.pt)}`));

  const added: { pt: string; en: string; categorySlug: string; categoryPt: string }[] = [];
  let skipped = entries.length - wanted.length;
  const rows: (typeof refEntries.$inferInsert)[] = [];
  for (const e of wanted) {
    const key = `${e.cat!.id}|${normalizePt(e.pt)}`;
    if (taken.has(key)) {
      skipped += 1;
      continue;
    }
    taken.add(key);
    rows.push({
      categoryId: e.cat!.id,
      kind: e.kind,
      section: e.section,
      pt: e.pt,
      en: e.en,
      note: e.note,
      addedBy: session.username,
    });
    added.push({
      pt: e.pt,
      en: e.en,
      categorySlug: e.cat!.slug,
      categoryPt: e.cat!.namePt,
    });
  }
  if (rows.length > 0) {
    await db.insert(refEntries).values(rows);
    await logActivity(
      session.username,
      "reference",
      `Ingeriu ${rows.length} ${rows.length === 1 ? "entrada" : "entradas"} no livro 📥`,
      Math.min(15, 3 + rows.length)
    );
  }

  return NextResponse.json({ added, skipped, truncated });
}
