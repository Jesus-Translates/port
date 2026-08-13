import Link from "next/link";
import { unitContextFrom } from "@/lib/unit-context";
import { VerbConjugator } from "@/components/verb-conjugator";
import { VerbTest } from "@/components/verb-test";
import { listMyVerbs } from "@/lib/actions/verbs";
import { requireSession } from "@/lib/auth";
import { TENSE_LABEL, type Tense, VERBS } from "@/lib/verbs";
import { cn } from "@/lib/utils";

export const metadata = { title: "Conjugador" };

const TABS = [
  {
    key: "consultar",
    emoji: "📖",
    label: "Consultar",
    sub: "tabelas com áudio",
  },
  { key: "treinar", emoji: "🎯", label: "Treinar", sub: "escreve, escolhe, diz" },
] as const;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ConjugadorPage(props: PageProps<"/verbos">) {
  await requireSession();
  const sp = await props.searchParams;

  const tab = first(sp.tab) === "treinar" ? "treinar" : "consultar";
  // A verb step opened from a unit lands straight on the trainer.
  const unit = await unitContextFrom(sp);
  // Deep links (?verbo=ficar&tempo=perfeito) are validated against the data —
  // an unknown value just falls back to the default rather than blowing up.
  // The household's own verbs are searched alongside the curated ones.
  const mine = await listMyVerbs();
  const wanted = first(sp.verbo);
  const verbo =
    VERBS.some((v) => v.inf === wanted) || mine.some((v) => v.inf === wanted)
      ? wanted
      : undefined;
  const tempoRaw = first(sp.tempo);
  const tempo =
    tempoRaw && tempoRaw in TENSE_LABEL ? (tempoRaw as Tense) : undefined;

  const query = new URLSearchParams();
  if (verbo) query.set("verbo", verbo);
  if (tempo) query.set("tempo", tempo);
  const suffix = query.toString() ? `&${query.toString()}` : "";

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/practice"
          className="text-xs text-ink-faint hover:text-olive"
        >
          ← Praticar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          🔤 Conjugador
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Look a verb up, hear every form, then test yourself on any slice of
          it — say <em>-ar verbs, pretérito perfeito, irregulars only</em> — by
          writing, choosing or speaking. European Portuguese throughout:{" "}
          <em>falámos</em>, not <em>falamos</em>.
        </p>
      </header>

      <nav className="grid grid-cols-2 gap-2 rounded-2xl border border-sand bg-white/60 p-1.5">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/verbos?tab=${t.key}${suffix}`}
            aria-current={tab === t.key ? "page" : undefined}
            className={cn(
              "rounded-xl px-3 py-2.5 text-center transition-colors",
              tab === t.key
                ? "bg-olive text-paper shadow"
                : "text-ink-soft hover:bg-sage-pale"
            )}
          >
            <div className="text-sm font-semibold">
              <span aria-hidden>{t.emoji}</span> {t.label}
            </div>
            <div
              className={cn(
                "text-2xs",
                tab === t.key ? "text-paper/80" : "text-ink-faint"
              )}
            >
              {t.sub}
            </div>
          </Link>
        ))}
      </nav>

      {tab === "treinar" ? (
        <VerbTest initialTense={tempo} unit={unit} />
      ) : (
        <VerbConjugator initialVerb={verbo} initialTense={tempo} mine={mine} />
      )}
    </div>
  );
}
