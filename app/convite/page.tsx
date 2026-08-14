import Link from "next/link";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { peekAuthToken } from "@/lib/auth-tokens";
import { accounts, getDb } from "@/lib/db";
import { InviteAcceptForm } from "@/components/invite-accept-form";

export const metadata = { title: "Convite" };

/**
 * Where an invite email lands. Public (proxy.ts) — the invitee has no account.
 *
 * This page only PEEKS at the token to decide what to render; nothing is
 * claimed until the form is actually submitted, so a curious click today
 * does not burn the invite for tomorrow. Each dead-end (used, expired,
 * unknown, already signed in) gets its own honest message — none of which
 * says anything about any account, because none of them knows anything.
 */
export default async function ConvitePage({
  searchParams,
}: {
  // Typed by hand rather than PageProps<"/convite">: the generated route
  // union in .next/types does not learn about a route until the next dev/build
  // pass, and tsc has to stay green before that.
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const session = await getSession();

  let content: React.ReactNode;

  if (session) {
    // Redeeming while signed in would graft a NEW account onto someone who
    // already has one. Stop, explain, and leave the token unclaimed.
    content = (
      <Dead
        emoji="👋"
        title={`Já tens sessão iniciada, ${session.displayName}`}
        body="Para aceitares este convite e criares uma conta nova, sai primeiro da tua conta atual e volta a abrir o link do email."
      />
    );
  } else {
    const peek = t ? await peekAuthToken(t, "invite") : { status: "unknown" as const };
    if (peek.status === "used") {
      content = (
        <Dead
          emoji="✅"
          title="Este convite já foi utilizado"
          body="Cada convite funciona uma única vez. Se foste tu, entra com a tua conta; se não, pede um convite novo à tua família."
        />
      );
    } else if (peek.status === "expired") {
      content = (
        <Dead
          emoji="⏳"
          title="Este convite expirou"
          body="Os convites são válidos durante 7 dias. Pede à tua família que te envie um novo."
        />
      );
    } else if (peek.status !== "ok" || peek.accountId === null) {
      content = (
        <Dead
          emoji="🤔"
          title="Este convite não é válido"
          body="Confirma que abriste o link completo do email. Se o problema continuar, pede um convite novo."
        />
      );
    } else {
      const [account] = await getDb()
        .select({ name: accounts.name })
        .from(accounts)
        .where(eq(accounts.id, peek.accountId))
        .limit(1);
      if (!account) {
        content = (
          <Dead
            emoji="🤔"
            title="Este convite não é válido"
            body="A família deste convite já não existe. Pede um convite novo."
          />
        );
      } else {
        content = <InviteAcceptForm token={t!} familyName={account.name} />;
      }
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-paper via-paper to-sage-pale px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mb-3 text-5xl" aria-hidden>
            🇵🇹
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Convite · Invitation
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            European Portuguese for the whole family, with Sandra
          </p>
        </div>
        {content}
        <p className="mt-6 text-center text-xs text-ink-faint">
          <Link href="/login" className="hover:text-olive">
            Já tens conta? Entrar · Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Dead({
  emoji,
  title,
  body,
}: {
  emoji: string;
  title: string;
  body: string;
}) {
  return (
    <div className="card space-y-3 p-6 text-center">
      <div className="text-4xl" aria-hidden>
        {emoji}
      </div>
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="text-sm leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}
