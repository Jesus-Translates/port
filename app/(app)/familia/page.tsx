import { FamilyBoard } from "@/components/family-board";
import { getValidUsers, requireSession } from "@/lib/auth";
import { getFamilyBoard, getRecentKudos } from "@/lib/data";

export const metadata = { title: "Família" };

export default async function FamilyPage() {
  const session = await requireSession();
  const [board, recent] = await Promise.all([
    getFamilyBoard(getValidUsers()),
    getRecentKudos(15),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          🏆 A família
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Who&apos;s ahead this week — and a place to cheer each other on. Give a
          golden star when someone does something you&apos;re proud of.
        </p>
      </header>

      <FamilyBoard
        board={board}
        me={session.username}
        recent={recent.map((k) => ({
          id: k.id,
          fromUser: k.fromUser,
          toUser: k.toUser,
          kind: k.kind,
          message: k.message,
          createdAt: k.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
