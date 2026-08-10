import Link from "next/link";
import { FamilyBoard } from "@/components/family-board";
import { FamilySettings } from "@/components/family-settings";
import { requireSession } from "@/lib/auth";
import { householdUsernames } from "@/lib/tenant";
import { getFamilyBoard, getRecentKudos } from "@/lib/data";
import {
  canSetHouseholdSettings,
  getHouseholdSettings,
} from "@/lib/actions/household-settings";

export const metadata = { title: "Família" };

export default async function FamilyPage() {
  const session = await requireSession();
  const [board, recent, settings, canEdit] = await Promise.all([
    getFamilyBoard(await householdUsernames()),
    getRecentKudos(15),
    getHouseholdSettings(),
    canSetHouseholdSettings(),
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

      {/* How the app speaks to this house. Set once, applies to everyone. */}
      <FamilySettings initial={settings} canEdit={canEdit} />

      {/*
       * Família was the only nav tab with nowhere to go — a leaderboard and
       * some stars, then a full stop. It is also the tab a child is most
       * likely to open first, so the one thing it must offer is a way to go
       * and earn a place on it.
       */}
      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/jogos"
          className="card group flex items-center gap-3 p-4 transition-all hover:border-sage hover:shadow-md"
        >
          <span className="text-2xl" aria-hidden>
            🎮
          </span>
          <span className="min-w-0">
            <span className="block font-semibold group-hover:text-olive">
              Desafia a família
            </span>
            <span className="block text-sm text-ink-soft">
              Seis jogos rápidos — cada ronda conta para os teus pontos.
            </span>
          </span>
        </Link>
        <Link
          href="/notes"
          className="card group flex items-center gap-3 p-4 transition-all hover:border-sage hover:shadow-md"
        >
          <span className="text-2xl" aria-hidden>
            📝
          </span>
          <span className="min-w-0">
            <span className="block font-semibold group-hover:text-olive">
              Notas da família
            </span>
            <span className="block text-sm text-ink-soft">
              Apontamentos que toda a gente cá em casa pode ler.
            </span>
          </span>
        </Link>
      </section>
    </div>
  );
}
