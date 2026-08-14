import Link from "next/link";
import { AzulejoHeader } from "@/components/azulejo-header";
import { Bi } from "@/components/bilingual";
import { ChangeMyPassword } from "@/components/change-my-password";
import { DailyGoalPicker } from "@/components/daily-goal-picker";
import { ImmersionToggle } from "@/components/immersion-toggle";
import { SignOut } from "@/components/sign-out";
import { ZonePicker } from "@/components/zone-picker";
import { isOperator, requireSession, roleOf } from "@/lib/auth";
import { getHouseholdSettings } from "@/lib/actions/household-settings";
import { getMyCefr, getMyPrefs, getZones } from "@/lib/actions/profile";
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
  const operator = await isOperator(session.username);
  const [role, cefr, place, prefs, house, zones] = await Promise.all([
    roleOf(session.username),
    getMyCefr().catch(() => null),
    getPlace(session.username).catch(() => null),
    getMyPrefs().catch(() => null),
    getHouseholdSettings(),
    // Empty list still renders: the picker's "I don't live in Portugal" and
    // free-text locality both work without a researched zone to choose.
    getZones().catch(() => []),
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
        <p className="label">
          <Bi pt="Meta diária" en="Daily goal" inline />
        </p>
        <DailyGoalPicker initial={prefs?.minutes ?? "15"} />
        <p className="text-2xs text-ink-faint">
          É isto que enche o anel em Hoje. Muda quando a vida mudar.
        </p>
      </section>

      {/*
        Where they live, editable HERE.
        It was collected once during onboarding and then only reachable back
        through /bem-vindo — a screen called "welcome" that a settled user has
        no reason to revisit, and which reads like starting over. So in
        practice moving house meant living with the wrong town forever.
        It is not a cosmetic field: getPlace feeds currentStyle() and
        referenceContext(), so it decides which region's vocabulary and
        examples Sandra reaches for. Wrong town, subtly wrong Portuguese.
      */}
      <section className="space-y-2">
        <p className="label">
          <Bi pt="Onde vives" en="Where you live" inline />
        </p>
        <ZonePicker
          initial={
            place ?? {
              livesInPortugal: null,
              locality: null,
              zoneSlug: null,
              placeSlug: null,
            }
          }
          zones={zones}
        />
        <p className="text-2xs text-ink-faint">
          Mudaste de casa? Muda aqui — a Sandra passa a usar o vocabulário e os
          exemplos dessa zona.
        </p>
      </section>

      <section className="space-y-2">
        <p className="label">
          <Bi pt="Como aprendes" en="How you learn" inline />
        </p>
        <div className="card divide-y divide-cream overflow-hidden">
          <ImmersionToggle
            initial={immersionOn}
            followingFamily={followingFamily}
          />
          <Row
            href="/bem-vindo"
            title="Rever as preferências"
            titleEn="Review your preferences"
            sub="Tempo por dia, jogos, e quanta ajuda queres"
          />
        </div>
      </section>

      <section className="space-y-2">
        <p className="label">
          <Bi pt="A tua conta" en="Your account" inline />
        </p>
        <div className="card divide-y divide-cream overflow-hidden">
          {/* Plan and seats — never running costs. Those are operator numbers
              and live on /gastos, which now refuses everyone else. */}
          <Row
            href="/conta"
            title="O vosso plano"
            titleEn="Your plan"
            sub="Subscrição, lugares e renovação"
          />
          {operator ? (
            <Row
              href="/gastos"
              title="Custos de IA"
              titleEn="AI running costs"
              sub="O que a IA custou a correr este mês"
            />
          ) : null}
          {role !== "student" || operator ? (
            <Row href="/admin" title="Painel"
              titleEn="Admin panel" sub="Gerir contas, conteúdo e famílias" />
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
  titleEn,
  sub,
}: {
  href: string;
  title: string;
  /** Shown under the title when the family turned on "Inglês ao lado". */
  titleEn: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-14 items-center gap-3 px-4 py-3.5 transition-colors hover:bg-sage-pale/50"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-medium">
          <Bi pt={title} en={titleEn} inline />
        </span>
        <span className="block text-xs text-ink-faint">{sub}</span>
      </span>
      <span className="text-ink-faint" aria-hidden>
        ›
      </span>
    </Link>
  );
}
