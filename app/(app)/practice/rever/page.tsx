import Link from "next/link";
import { EnrolPanel } from "@/components/enrol-panel";
import { ReviewPlayer } from "@/components/review-player";
import { requireSession } from "@/lib/auth";
import { getDeckOverview } from "@/lib/actions/review";
import { getQueue } from "@/lib/srs";

export const metadata = { title: "Rever" };

export default async function ReviewPage() {
  const session = await requireSession();
  const [queue, deck] = await Promise.all([
    getQueue(session.username),
    getDeckOverview(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <Link href="/practice" className="text-xs text-ink-faint hover:text-olive">
          ← Praticar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          🔁 Rever
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Spaced repetition over the family book and your own mistakes — each
          card comes back right before you would forget it.
        </p>
      </header>

      {queue.length > 0 ? (
        <ReviewPlayer
          initialQueue={queue.map((c) => ({
            id: c.id,
            kind: c.kind,
            front: c.front,
            back: c.back,
            note: c.note,
          }))}
        />
      ) : deck.total === 0 ? (
        <div className="card p-8 text-center">
          <div className="mb-2 text-4xl" aria-hidden>
            🌱
          </div>
          <p className="font-medium">O teu baralho está vazio.</p>
          <p className="mt-1 text-sm text-ink-soft">
            Add categories from the book below — errors from homework and
            quizzes join automatically.
          </p>
        </div>
      ) : (
        <div className="card p-8 text-center">
          <div className="mb-2 text-4xl" aria-hidden>
            🎉
          </div>
          <p className="font-medium">Tudo revisto por hoje!</p>
          <p className="mt-1 text-sm text-ink-soft">
            {deck.total} cartões no baralho. Volta amanhã — a Luna guarda a
            ordem certa.
          </p>
        </div>
      )}

      <EnrolPanel
        byCategory={deck.byCategory}
        deckTotal={deck.total}
        due={deck.due}
      />
    </div>
  );
}
