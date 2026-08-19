"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import {
  createSessionToken,
  getSession,
  requireSession,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";
import { accounts, getDb, memberships, people, users } from "@/lib/db";
import { currentAccountId } from "@/lib/tenant";
import {
  claimAuthToken,
  createAuthToken,
  INVITE_TTL_MS,
  peekAuthToken,
  releaseAuthToken,
  voidAuthToken,
} from "@/lib/auth-tokens";
import { insertMember, usernameProblem } from "@/lib/create-member";
import { hashPassword, passwordProblem } from "@/lib/password";
import { sendInviteEmail } from "@/lib/email";
import { logActivity } from "@/lib/data";

/**
 * Family invites: an owner or parent emails someone a link instead of typing
 * a password for them; the invitee picks their own username and password and
 * joins THAT household — the accountId travels on the token row, never in the
 * form, so an invite cannot be redirected at a different family.
 *
 * Every export here is a network-callable endpoint. sendInvite authorises via
 * the session; acceptInvite runs signed-out on purpose — its authorisation IS
 * the possession of a valid, unused, unexpired invite token.
 */

const SITE = process.env.SITE_URL ?? "https://port.robertjeremiah.com";

export async function sendInvite(input: {
  email: string;
  /** "parent" | "child" — anything else becomes "child". Never "owner". */
  role?: string;
}): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const session = await requireSession();
  const accountId = await currentAccountId();
  if (accountId === null) {
    return { ok: false, error: "A tua conta ainda não pertence a uma família." };
  }

  // Only an owner or parent may invite — same check the billing actions make.
  const db = getDb();
  const [me] = await db
    .select({ role: memberships.role })
    .from(memberships)
    .where(eq(memberships.username, session.username))
    .limit(1);
  if (me?.role !== "owner" && me?.role !== "parent") {
    return { ok: false, error: "Só um adulto da família pode convidar." };
  }

  const email = String(input.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return { ok: false, error: "Email inválido." };
  }
  // The INVITER sets the role, here and nowhere else. Capped below owner.
  const role = input.role === "parent" ? ("parent" as const) : ("child" as const);

  // No seat, no invite — checked again at acceptance, because seats can fill
  // during the seven days the link is alive.
  const [account] = await db
    .select({ seatLimit: accounts.seatLimit, name: accounts.name })
    .from(accounts)
    .where(eq(accounts.id, accountId))
    .limit(1);
  if (!account) return { ok: false, error: "Família não encontrada." };
  const taken = (
    await db
      .select({ username: memberships.username })
      .from(memberships)
      .where(eq(memberships.accountId, accountId))
  ).length;
  if (taken >= account.seatLimit) {
    return {
      ok: false,
      error: `A família tem ${account.seatLimit} lugares e já estão todos ocupados. Podes aumentar os lugares em Conta.`,
    };
  }

  const raw = await createAuthToken({
    kind: "invite",
    email,
    accountId,
    role,
    ttlMs: INVITE_TTL_MS,
  });

  // The raw token exists only inside this URL, only inside this email.
  const sent = await sendInviteEmail({
    to: email,
    url: `${SITE}/convite?t=${raw}`,
    familyName: account.name,
  });
  if (!sent.ok) {
    // Fail soft, but never silently: kill the token and say so. A working
    // link that nobody received is worse than an honest error.
    await voidAuthToken(raw).catch(() => {});
    return {
      ok: false,
      error: "Não foi possível enviar o convite agora. Tenta daqui a pouco.",
    };
  }

  await logActivity(
    session.username,
    "admin",
    "Convidou alguém para a família ✉️",
    0
  ).catch(() => {});
  return { ok: true, email };
}

/**
 * Redeem an invite: create the member and sign them in.
 *
 * Runs signed-out. The order matters: every friendly, retryable refusal
 * (name taken, family full) happens BEFORE the token is claimed, so a failed
 * attempt does not burn the invite. The claim itself is one guarded UPDATE —
 * two racing submissions cannot both create an account. Only if the insert
 * then fails is the claim released, and only because nothing was created.
 */
export async function acceptInvite(input: {
  token: string;
  displayName: string;
  username: string;
  password: string;
}): Promise<{ ok: false; error: string }> {
  const session = await getSession();
  if (session) {
    return {
      ok: false,
      error: "Já tens sessão iniciada. Sai primeiro para aceitares o convite.",
    };
  }

  const displayName = String(input.displayName ?? "").trim().slice(0, 60);
  if (!displayName) return { ok: false, error: "Falta o teu nome." };
  const username = String(input.username ?? "").trim().toLowerCase();
  const badName = usernameProblem(username);
  if (badName) return { ok: false, error: badName };
  const password = String(input.password ?? "");
  const badPw = passwordProblem(password);
  if (badPw) return { ok: false, error: badPw };

  // Look, don't claim yet: give the retryable refusals first.
  const peek = await peekAuthToken(String(input.token ?? ""), "invite");
  if (peek.status === "used") {
    return { ok: false, error: "Este convite já foi utilizado." };
  }
  if (peek.status === "expired") {
    return {
      ok: false,
      error: "Este convite expirou. Pede um novo à tua família.",
    };
  }
  if (peek.status !== "ok" || peek.accountId === null) {
    return { ok: false, error: "Este convite não é válido." };
  }

  const db = getDb();
  const [nameClash] = await db
    .select({ username: users.username })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  if (nameClash) {
    return { ok: false, error: "Esse nome de utilizador já existe. Escolhe outro." };
  }
  if (peek.email) {
    const [emailClash] = await db
      .select({ id: people.id })
      .from(people)
      .where(eq(people.email, peek.email))
      .limit(1);
    if (emailClash) {
      return {
        ok: false,
        error: "Esse email já tem conta. Entra com ele em vez de aceitares o convite.",
      };
    }
  }

  // The family may have filled its seats since the invite was sent.
  const [account] = await db
    .select({ seatLimit: accounts.seatLimit, name: accounts.name })
    .from(accounts)
    .where(eq(accounts.id, peek.accountId))
    .limit(1);
  if (!account) return { ok: false, error: "Este convite não é válido." };
  const taken = (
    await db
      .select({ username: memberships.username })
      .from(memberships)
      .where(eq(memberships.accountId, peek.accountId))
  ).length;
  if (taken >= account.seatLimit) {
    return {
      ok: false,
      error: `A família ${account.name} já não tem lugares livres. Fala com quem te convidou.`,
    };
  }

  const passwordHash = await hashPassword(password);

  // The atomic moment: exactly one submission gets past this line per token.
  const claimed = await claimAuthToken(String(input.token), "invite");
  if (!claimed || claimed.accountId === null) {
    return { ok: false, error: "Este convite já foi utilizado ou expirou." };
  }

  // Everything from the TOKEN, nothing from the form: the household is the
  // one on the invite's own row, and the role is what the inviter chose —
  // "parent" or "child", never anything the invitee could escalate to.
  const householdRole = claimed.role === "parent" ? ("parent" as const) : ("child" as const);
  try {
    await insertMember({
      accountId: claimed.accountId,
      username,
      displayName,
      email: claimed.email,
      passwordHash,
      appRole: householdRole === "parent" ? "teacher" : "student",
      householdRole,
    });
  } catch {
    // Safe to hand the invite back: insertMember writes the credential (users)
    // row LAST, so a throw here means no account exists — any stray person or
    // membership row is inert and non-credential. (Before the reorder, a
    // failure at the people/memberships step could leave a live users row
    // while this released the token, bricking the invite on retry.)
    await releaseAuthToken(claimed.id).catch(() => {});
    return {
      ok: false,
      error: "Não foi possível criar a conta. Tenta outra vez, talvez com outro nome.",
    };
  }

  await logActivity(username, "review", `Juntou-se à família ${account.name} 🎉`, 0).catch(
    () => {}
  );

  // The same 30-day session everyone else gets — then straight to onboarding.
  const token = await createSessionToken({ username, displayName });
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
  redirect("/bem-vindo");
}
