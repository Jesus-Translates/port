import Link from "next/link";
import { VerbCards } from "@/components/verb-cards";
import { requireSession } from "@/lib/auth";
import { listMyVerbs } from "@/lib/actions/verbs";
import { VERBS } from "@/lib/verbs";

export const metadata = { title: "Cartões de verbos" };

export default async function VerbCardsPage() {
  await requireSession();
  // Curated first, then the household's own — one deck, no seams.
  const mine = await listMyVerbs();
  const verbs = [...VERBS, ...mine];

  return (
    <div className="space-y-6">
      <header>
        <Link href="/jogos" className="text-xs text-ink-faint hover:text-olive">
          ← Jogos
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          🎴 Cartões de verbos
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Flip a card, say the answer in your head, then check. Pick the form
          you want to drill — the meaning, or any tense. Anything you miss goes
          to your review deck.
        </p>
        <p className="mt-1 text-xs text-ink-faint">
          {VERBS.length} verbos + {mine.length}{" "}
          {mine.length === 1 ? "guardado" : "guardados"} por vocês ·{" "}
          <Link href="/verbos" className="underline underline-offset-2 hover:text-olive">
            adicionar mais
          </Link>
        </p>
      </header>

      <VerbCards verbs={verbs} />
    </div>
  );
}
