import Link from "next/link";
import { AzulejoHeader } from "@/components/azulejo-header";
import { ChangeMyPassword } from "@/components/change-my-password";
import { ImmersionToggle } from "@/components/immersion-toggle";
import { SignOut } from "@/components/sign-out";
import { requireSession, roleOf } from "@/lib/auth";
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
  const [role, cefr, place, prefs] = await Promise.all([
    roleOf(session.username),
    getMyCefr().catch(() => null),
    getPlace(session.username).catch(() => null),
    getMyPrefs().catch(() => null),
  ]);

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
        <p className="label">Como aprendes</p>
        <div className="card divide-y divide-cream overflow-hidden">
          <ImmersionToggle initial={prefs?.immersion === "total"} />
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
          <Row
            href="/gastos"
            title="O teu gasto de IA"
            sub="Quanto custou este mês"
          />
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
