import Link from "next/link";
import { AzulejoHeader } from "@/components/azulejo-header";
import { FamilyBoard } from "@/components/family-board";
import { FamilySettings } from "@/components/family-settings";
import { currentAccountId } from "@/lib/tenant";
import { accounts, getDb } from "@/lib/db";
import { eq } from "drizzle-orm";
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
  const [board, recent, settings, canEdit, houseName] = await Promise.all([
    getFamilyBoard(await householdUsernames()),
    getRecentKudos(15),
    getHouseholdSettings(),
    canSetHouseholdSettings(),
    householdName(),
  ]);

  // "Everyone practised this week" — counted from the board rather than
  // stored, so the challenge cannot drift out of sync with the scores beside it.
  const activeCount = board.filter((m) => m.xpThisWeek > 0).length;
  const weekLabel = `Semana de ${new Date().toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Lisbon",
  })}`;

  return (
    <div className="space-y-6">
      <AzulejoHeader
        title={houseName}
        eyebrow={weekLabel}
        subtitle="Quem está à frente esta semana — e onde se dão as estrelas."
      />

      {/* One thing the whole house is doing, rather than five separate scores.
          Derived, not stored: the challenge is "everyone practises today", and
          the bar is how many of you actually have. */}
      <section className="rounded-[20px] bg-terra-pale p-[17px_18px]">
        <p className="text-xs font-semibold tracking-[.1em] text-terra uppercase">
          Desafio da semana
        </p>
        <p className="mt-1 font-display text-xl leading-snug font-semibold">
          Toda a gente pratica esta semana
        </p>
        <div className="mt-3 h-[9px] overflow-hidden rounded-full bg-terra-dark/20">
          <div
            className="h-[9px] rounded-full bg-terra transition-[width] duration-500"
            style={{
              width: `${board.length > 0 ? Math.round((activeCount / board.length) * 100) : 0}%`,
            }}
          />
        </div>
        <p className="mt-1.5 text-xs font-semibold text-terra-dark">
          {activeCount} / {board.length}{" "}
          {board.length === 1 ? "pessoa" : "pessoas"}
        </p>
      </section>

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

/** The family's own name for the band. Falls back rather than erroring. */
async function householdName(): Promise<string> {
  try {
    const id = await currentAccountId();
    if (id === null) return "A família";
    const [row] = await getDb()
      .select({ name: accounts.name })
      .from(accounts)
      .where(eq(accounts.id, id))
      .limit(1);
    return row?.name ?? "A família";
  } catch {
    return "A família";
  }
}
