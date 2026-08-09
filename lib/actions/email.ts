"use server";

import { desc, eq } from "drizzle-orm";
import { requireAdmin, requireSession } from "@/lib/auth";
import { emailLog, getDb, homework, users } from "@/lib/db";
import {
  button,
  emailConfigured,
  emailFrom,
  emailShell,
  escapeHtml,
  sendEmail,
  type SendResult,
} from "@/lib/email";

const SITE = process.env.SITE_URL ?? "https://port.robertjeremiah.com";

export type EmailStatus = {
  configured: boolean;
  from: string;
  recent: {
    kind: string;
    recipient: string;
    ok: boolean;
    error: string | null;
    at: string;
  }[];
};

export async function getEmailStatus(): Promise<EmailStatus> {
  await requireAdmin();
  let recent: EmailStatus["recent"] = [];
  try {
    const rows = await getDb()
      .select()
      .from(emailLog)
      .orderBy(desc(emailLog.createdAt))
      .limit(15);
    recent = rows.map((r) => ({
      kind: r.kind,
      // Enough to recognise the address without printing it in full.
      recipient: maskEmail(r.recipient),
      ok: r.ok,
      error: r.error,
      at: new Date(r.createdAt).toISOString().slice(0, 16).replace("T", " "),
    }));
  } catch {
    recent = [];
  }
  return { configured: emailConfigured(), from: emailFrom(), recent };
}

function maskEmail(address: string): string {
  const [user, domain] = address.split("@");
  if (!domain) return address;
  const head = user.slice(0, 2);
  return `${head}${user.length > 2 ? "…" : ""}@${domain}`;
}

/**
 * Send a test message to the ADMIN'S OWN address.
 *
 * Deliberately not "send a test to any address you type": a test button that
 * mails arbitrary strangers is a spam cannon, and the only address whose
 * consent an admin can be sure of is their own.
 */
export async function sendTestEmail(): Promise<SendResult> {
  const session = await requireAdmin();
  const [row] = await getDb()
    .select({ email: users.email, displayName: users.displayName })
    .from(users)
    .where(eq(users.username, session.username))
    .limit(1);

  if (!row?.email) {
    return {
      ok: false,
      id: null,
      error: "Não tens email na tua conta — adiciona um primeiro.",
    };
  }

  return sendEmail({
    to: row.email,
    kind: "test",
    subject: "Teste de email · Português",
    text: `Funciona. Se estás a ler isto, o envio de emails está configurado.\n\n${SITE}`,
    html: emailShell(
      "Funciona 🎉",
      `<p style="margin:0;font-size:15px;line-height:1.6">Se estás a ler isto, o envio de emails está configurado corretamente.</p>
       ${button(SITE, "Abrir a app")}`
    ),
  });
}

/**
 * Welcome a person an admin just added. Sent only when the account has an
 * address, and it never contains a password — an emailed password is a
 * password in a dozen mailboxes forever.
 */
export async function sendWelcomeEmail(
  username: string
): Promise<SendResult> {
  await requireAdmin();
  const [row] = await getDb()
    .select({ email: users.email, displayName: users.displayName })
    .from(users)
    .where(eq(users.username, username.toLowerCase()))
    .limit(1);
  if (!row?.email) {
    return { ok: false, id: null, error: "Esta conta não tem email." };
  }

  return sendEmail({
    to: row.email,
    kind: "welcome",
    subject: "Bem-vindo(a) ao Português",
    text: `Olá ${row.displayName}!\n\nTens uma conta em Português — o teu nome de utilizador é ${username.toLowerCase()}.\nPede a palavra-passe a quem criou a conta.\n\n${SITE}`,
    html: emailShell(
      `Olá, ${escapeHtml(row.displayName)}!`,
      `<p style="margin:0;font-size:15px;line-height:1.6">Tens uma conta em Português. O teu nome de utilizador é <strong>${escapeHtml(username.toLowerCase())}</strong>.</p>
       <p style="margin:12px 0 0;font-size:15px;line-height:1.6">Por segurança a palavra-passe não vai por email — pede-a a quem criou a conta.</p>
       ${button(`${SITE}/login`, "Entrar")}`
    ),
  });
}

/**
 * Tell a learner they have homework. Called by the person assigning it, and
 * addressed to the learner it was assigned TO.
 */
export async function sendHomeworkEmail(
  homeworkId: number
): Promise<SendResult> {
  const session = await requireSession();
  const db = getDb();
  const [hw] = await db
    .select({
      id: homework.id,
      title: homework.title,
      username: homework.username,
    })
    .from(homework)
    .where(eq(homework.id, homeworkId))
    .limit(1);
  if (!hw) return { ok: false, id: null, error: "TPC não encontrado." };

  const [learner] = await db
    .select({ email: users.email, displayName: users.displayName })
    .from(users)
    .where(eq(users.username, hw.username))
    .limit(1);
  if (!learner?.email) {
    return { ok: false, id: null, error: "Esse aluno não tem email." };
  }

  return sendEmail({
    to: learner.email,
    kind: "homework",
    subject: `TPC novo: ${hw.title}`,
    text: `Olá ${learner.displayName}!\n\n${session.displayName} deixou-te um TPC: "${hw.title}".\n\n${SITE}/homework/${hw.id}`,
    html: emailShell(
      "Tens TPC novo",
      `<p style="margin:0;font-size:15px;line-height:1.6"><strong>${escapeHtml(session.displayName)}</strong> deixou-te um TPC: “${escapeHtml(hw.title)}”.</p>
       <p style="margin:12px 0 0;font-size:15px;line-height:1.6">A Sandra corrige cada resposta assim que a escreves.</p>
       ${button(`${SITE}/homework/${hw.id}`, "Fazer o TPC")}`
    ),
  });
}
