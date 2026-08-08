import Link from "next/link";
import { UnitReturn } from "@/components/unit-return";
import { VerbDrill } from "@/components/verb-drill";
import { requireSession } from "@/lib/auth";
import { unitContextFrom } from "@/lib/unit-context";
import { VERBS, type Tense } from "@/lib/verbs";

export const metadata = { title: "Verbos" };

function one(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : (v ?? "")).trim();
}

/** Accent- and case-blind, so "Pretérito" and "preterito" are the same word. */
function fold(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

/**
 * Order matters twice over. "imperfeito" contains "perfeito", and "presente do
 * conjuntivo" contains "presente" — so the longer, more specific name claims
 * (and consumes) its words before the shorter one gets to look. Accents are
 * already folded away by the time these are compared.
 */
const TENSE_HINTS: [Tense, string[]][] = [
  ["imperfeito", ["imperfeito"]],
  [
    "conjuntivo",
    ["presente do conjuntivo", "conjuntivo", "subjuntivo", "subjunctive"],
  ],
  ["imperativo", ["imperativo", "imperative", "ordens", "instrucoes"]],
  ["perfeito", ["perfeito", "passado", "past tense"]],
  ["futuro", ["futuro do presente", "futuro", "future"]],
  ["presente", ["presente", "present"]],
];

/** Which tenses a unit topic is asking for — empty when it names none, in
 *  which case the learner's own choice stands. */
function tensesFromTopic(tema: string): Tense[] {
  let hay = fold(tema);
  const found: Tense[] = [];
  for (const [tense, words] of TENSE_HINTS) {
    if (words.some((w) => hay.includes(w))) {
      found.push(tense);
      // Consume the words we just matched so a longer name can't be read a
      // second time as the shorter one it contains.
      hay = words.reduce((h, w) => h.split(w).join(" "), hay);
    }
  }
  return found;
}

/** Verbs the topic names by infinitive — "ser e estar", "pedir no café". */
function verbsFromTopic(tema: string): string[] {
  const raw = new Set(tema.toLowerCase().split(/[^\p{L}]+/u).filter(Boolean));
  const folded = new Set([...raw].map(fold));
  return VERBS.filter((v) => {
    const inf = v.inf.toLowerCase();
    // "pôr" folds to "por", the commonest preposition in the language — only
    // count it when the topic really wrote the verb.
    if (inf === "pôr") return raw.has("pôr");
    return raw.has(inf) || folded.has(fold(inf));
  }).map((v) => v.inf);
}

export default async function VerbosPage(props: PageProps<"/practice/verbos">) {
  await requireSession();
  const sp = await props.searchParams;
  const tema = one(sp.tema).slice(0, 300);
  const unit = await unitContextFrom(sp);

  const tenses = tensesFromTopic(tema);
  const focusVerbs = verbsFromTopic(tema);

  return (
    <div className="space-y-6">
      <header>
        {unit ? (
          <UnitReturn unit={unit} />
        ) : (
          <Link href="/practice" className="text-xs text-ink-faint hover:text-olive">
            ← Praticar
          </Link>
        )}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          ⚡ Verbos
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Conjugation sprints over the 30 verbs that carry everyday pt-PT.
          Note: European Portuguese says <em>falámos</em> (with the accent) in
          the pretérito perfeito.
        </p>
        {tema ? (
          <p className="mt-2 flex flex-wrap gap-1.5">
            {/* Unit topics are whole sentences — show enough to recognise the
                step, not enough to swallow the screen. */}
            <span className="chip bg-cream text-ink-soft">
              🎯 {tema.length > 80 ? `${tema.slice(0, 80).trimEnd()}…` : tema}
            </span>
            {focusVerbs.length > 0 ? (
              <span className="chip">{focusVerbs.join(" · ")}</span>
            ) : null}
          </p>
        ) : null}
      </header>
      <VerbDrill
        initialTenses={tenses}
        focusVerbs={focusVerbs}
        unit={unit}
      />
    </div>
  );
}
