import Link from "next/link";
import { AzulejoHeader } from "@/components/azulejo-header";
import { ChangeMyPassword } from "@/components/change-my-password";
import { DailyGoalPicker } from "@/components/daily-goal-picker";
import { ImmersionToggle } from "@/components/immersion-toggle";
import { SignOut } from "@/components/sign-out";
import { envRole, requireSession, roleOf } from "@/lib/auth";
import { getHouseholdSettings } from "@/lib/actions/household-settings";
import { getMyCefr, getMyPrefs } from "@/lib/actions/profile";
import { getPlace } from "@/lib/place";
import { avatarFor } from "@/lib/people";

export const metadata = { title: "Perfil" };

/**
 * Perfil — the account screen the redesign's tab bar assumes.
 *
 * It exists at this point in the build for a specific reason: the app's top
 * header is now hidden on phones so the azulejo band can be the top of the
 * screen, and that header was the ONLY route to sign-out, spend and the admin
 * panel. Everything it carried is re-homed here.
 *
 * The daily-goal picker and preference toggles from the design land in a later
 * pass; this is the part that must not be missing today.
 */
export default async function PerfilPage() {
  const session = await requireSession();
  // Instance operator, not a family admin: /registar makes every family
  // owner users.role "admin", so roleOf cannot gate operator-only surfaces.
  const isOperator = envRole(session.username) === "admin";
  const [role, cefr, place, prefs, house] = await Promise.all([
    roleOf(session.username),
    getMyCefr().catch(() => null),
    getPlace(session.username).catch(() => null),
    getMyPrefs().catch(() => null),
    getHouseholdSettings(),
  ]);

  /*
   * The RESOLVED state, not the raw preference.
   *
   * "familia" is the default and means "whatever the house chose", so showing
   * the raw value would leave this switch off while Sandra was speaking only
   * Portuguese — a control that disagrees with what is happening.
   */
  const followingFamily = prefs?.immersion !== "total" && prefs?.immersion !== "ajuda";
  const immersionOn = followingFamily
    ? house.immersion === "total"
    : prefs?.immersion === "total";

  const sub = [cefr, place?.locality].filter(Boolean).join(" · ");

  return (
    <div className="space-y-6">
      <AzulejoHeader
        title={session.displayName}
        subtitle={sub || "A tua conta"}
        trailing={
          <span className="grid size-14 shrink-0 place-items-center rounded-[19px] border-[1.5px] border-paper/30 bg-paper/15 font-display text-[23px] font-semibold">
            {avatarFor(session.displayName)}
          </span>
        }
      />

      <section className="space-y-2">
        <p className="label">Meta diária</p>
        <DailyGoalPicker initial={prefs?.minutes ?? "15"} />
        <p className="text-2xs text-ink-faint">
          É isto que enche o anel em Hoje. Muda quando a vida mudar.
        </p>
      </section>

      <section className="space-y-2">
        <p className="label">Como aprendes</p>
        <div className="card divide-y divide-cream overflow-hidden">
          <ImmersionToggle
            initial={immersionOn}
            followingFamily={followingFamily}
          />
          <Row
            href="/bem-vindo"
            title="Rever as preferências"
            sub="Tempo por dia, jogos, e quanta ajuda queres"
          />
        </div>
      </section>

      <section className="space-y-2">
        <p className="label">A tua conta</p>
        <div className="card divide-y divide-cream overflow-hidden">
          {/* Plan and seats — never running costs. Those are operator numbers
              and live on /gastos, which now refuses everyone else. */}
          <Row
            href="/conta"
            title="O vosso plano"
            sub="Subscrição, lugares e renovação"
          />
          {isOperator ? (
            <Row
              href="/gastos"
              title="Custos de IA"
              sub="O que a IA custou a correr este mês"
            />
          ) : null}
          {role !== "student" ? (
            <Row href="/admin" title="Painel" sub="Gerir contas, conteúdo e famílias" />
          ) : null}
        </div>
      </section>

      <ChangeMyPassword />

      <SignOut />
    </div>
  );
}

function Row({
  href,
  title,
  sub,
}: {
  href: string;
  title: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-14 items-center gap-3 px-4 py-3.5 transition-colors hover:bg-sage-pale/50"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-medium">{title}</span>
        <span className="block text-xs text-ink-faint">{sub}</span>
      </span>
      <span className="text-ink-faint" aria-hidden>
        ›
      </span>
    </Link>
  );
}
