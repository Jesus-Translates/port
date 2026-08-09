import { desc, eq, sql } from "drizzle-orm";
import Link from "next/link";
import { DeckManage, type DeckRow } from "@/components/deck-manage";
import { requireSession } from "@/lib/auth";
import { cards, getDb } from "@/lib/db";

export const metadata = { title: "Gerir revisão" };

export default async function GerirPage() {
  const session = await requireSession();
  const db = getDb();

  const rows = await db
    .select({
      id: cards.id,
      kind: cards.kind,
      front: cards.front,
      back: cards.back,
      state: cards.state,
      // "Mastered" = parked more than a year out by the Já domino button.
      // Computed in SQL: reading the clock during render isn't allowed.
      mastered: sql<boolean>`${cards.due} > now() + interval '365 days'`,
    })
    .from(cards)
    .where(eq(cards.username, session.username))
    .orderBy(desc(cards.id));

  const deck: DeckRow[] = rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    front: r.front,
    back: r.back,
    state: r.state,
    mastered: Boolean(r.mastered),
  }));

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/practice/rever"
          className="text-xs text-ink-faint hover:text-olive"
        >
          ← Rever
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          ⚙️ Gerir revisão
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Everything in your deck, newest first. Retire the cards you already
          know with <em>Já domino</em> — they stop coming back but stay
          searchable — or remove them for good.
        </p>
      </header>

      {deck.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="mb-2 text-4xl" aria-hidden>
            🌱
          </div>
          <p className="font-medium">O teu baralho está vazio.</p>
          <p className="mt-1 text-sm text-ink-soft">
            Add categories from the book, or save words straight from Sandra&apos;s
            answers.
          </p>
        </div>
      ) : (
        <DeckManage rows={deck} />
      )}
    </div>
  );
}
