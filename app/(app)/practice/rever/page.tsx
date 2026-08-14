import Link from "next/link";
import { AzulejoHeader } from "@/components/azulejo-header";
import { EnrolPanel } from "@/components/enrol-panel";
import { ReviewPlayer } from "@/components/review-player";
import { requireSession } from "@/lib/auth";
import { getDeckOverview } from "@/lib/actions/review";
import { getFlashQueue, getQueue } from "@/lib/srs";

export const metadata = { title: "Rever" };

export default async function ReviewPage(props: PageProps<"/practice/rever">) {
  const session = await requireSession();
  const { flash } = await props.searchParams;
  const isFlash = flash === "1";
  const [queue, deck] = await Promise.all([
    isFlash ? getFlashQueue(session.username, 5) : getQueue(session.username),
    getDeckOverview(),
  ]);

  return (
    <div className="space-y-6">
      <AzulejoHeader
        eyebrow={
          // The way back rides in the eyebrow slot — colour comes from the
          // band's own /85 floor, so it stays legible on olive.
          <Link href="/practice" className="transition-colors hover:text-paper">
            ← Praticar
          </Link>
        }
        title={isFlash ? "Flash review" : "Rever"}
        subtitle={
          isFlash
            ? "Five quick cards as a sanity check — pass with Bom or better to complete each one."
            : "Spaced repetition over the family book and your own mistakes — each card comes back right before you would forget it."
        }
      />

      {queue.length > 0 ? (
        <ReviewPlayer
          key={isFlash ? "flash" : "full"}
          flash={isFlash}
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
            {deck.total} cartões no baralho. Volta amanhã — a Sandra guarda a
            ordem certa.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <EnrolPanel
          byCategory={deck.byCategory}
          deckTotal={deck.total}
          due={deck.due}
        />
        <div className="text-right">
          <Link
            href="/practice/rever/gerir"
            className="text-xs text-ink-faint hover:text-olive"
          >
            ⚙️ Gerir o baralho
          </Link>
        </div>
      </div>
    </div>
  );
}
