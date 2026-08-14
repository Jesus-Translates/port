import { getDb, emailLog } from "@/lib/db";

/**
 * Email, through one door.
 *
 * Same shape as the Azure speech seam: nothing throws when the provider is not
 * configured, every send goes through one function, and every attempt is
 * recorded. A send that silently no-ops is worse than one that fails loudly —
 * "did the parent get the email?" must be answerable.
 */

export type SendResult = {
  ok: boolean;
  /** Resend's id when accepted, so a delivery can be traced later. */
  id: string | null;
  error: string | null;
};

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && emailFrom());
}

/**
 * The From address. Resend will only accept a domain you have verified, so
 * this is deliberately explicit rather than guessed from the site URL.
 */
export function emailFrom(): string {
  return process.env.EMAIL_FROM ?? "";
}

/** Where replies should go, when it differs from the sending identity. */
function replyTo(): string | undefined {
  return process.env.EMAIL_REPLY_TO || undefined;
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Groups sends in the log and in Resend: "welcome", "homework", "test". */
  kind: string;
}): Promise<SendResult> {
  const to = input.to.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return record(input.kind, to, { ok: false, id: null, error: "Endereço inválido." });
  }
  if (!emailConfigured()) {
    return record(input.kind, to, {
      ok: false,
      id: null,
      error: "Email não configurado (falta RESEND_API_KEY ou EMAIL_FROM).",
    });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: emailFrom(),
        to: [to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        reply_to: replyTo(),
        tags: [{ name: "kind", value: input.kind }],
      }),
    });

    const body = (await res.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
      name?: string;
    };
    if (!res.ok) {
      const error = `${res.status} ${body.name ?? ""} ${body.message ?? ""}`.trim();
      console.error(`resend send failed: ${error}`);
      return record(input.kind, to, { ok: false, id: null, error });
    }
    return record(input.kind, to, { ok: true, id: body.id ?? null, error: null });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return record(input.kind, to, { ok: false, id: null, error });
  }
}

/** Every attempt lands in the log, successful or not. */
async function record(
  kind: string,
  to: string,
  result: SendResult
): Promise<SendResult> {
  try {
    await getDb().insert(emailLog).values({
      kind,
      recipient: to,
      ok: result.ok,
      providerId: result.id,
      error: result.error?.slice(0, 500) ?? null,
    });
  } catch {
    // Logging must never be the reason a message fails to send.
  }
  return result;
}

/**
 * One house style for every message, so a parent can tell at a glance that it
 * really came from the app. Plain, readable, and legible without images —
 * most mail clients block those by default anyway.
 */
export function emailShell(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="pt-PT"><body style="margin:0;padding:24px;background:#faf7f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#2c2a26">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e8e0d4;border-radius:16px;padding:28px">
    <p style="margin:0 0 4px;font-size:13px;color:#8a8378">🇵🇹 Português</p>
    <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3">${escapeHtml(title)}</h1>
    ${bodyHtml}
  </div>
  <p style="max-width:520px;margin:16px auto 0;font-size:12px;color:#8a8378;text-align:center">
    Recebeste isto porque tens conta em Português.
  </p>
</body></html>`;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function button(href: string, label: string): string {
  return `<p style="margin:20px 0"><a href="${escapeHtml(href)}" style="display:inline-block;background:#6b7f5e;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600">${escapeHtml(label)}</a></p>`;
}

/**
 * The daily nudge, sent by /api/cron/reminders — session-free like sendWelcome.
 *
 * The one rule: lead with the learner's OWN number. "Tens 7 cartões à espera"
 * is a reason to come back; "já estudaste hoje?" is a guilt trip, and guilt is
 * how reminder emails earn the unsubscribe. Exactly one link, pointed at the
 * thing the number describes.
 *
 * Returns the SendResult so the cron can count sends and failures; the send is
 * already fail-soft (sendEmail never throws) and every attempt lands in
 * email_log under kind "reminder" — which is also what the cron's dedup reads.
 */
export async function sendReminder(input: {
  to: string;
  displayName: string;
  /** Review cards due right now. */
  due: number;
  /** Current streak in days, 0 when there is none. */
  streak: number;
}): Promise<SendResult> {
  const site = process.env.SITE_URL ?? "https://port.robertjeremiah.com";
  const { due, streak } = input;

  const cartoes = due === 1 ? "1 cartão" : `${due} cartões`;
  const sequencia = `a tua sequência de ${streak} ${streak === 1 ? "dia" : "dias"}`;

  // Cards first: they are the concrete, countable reason to open the app.
  // The streak rides along as a second sentence when it exists.
  const subject =
    due > 0
      ? `Tens ${cartoes} à espera 🇵🇹`
      : `Cinco minutos hoje e ${sequencia} continua 🇵🇹`;

  const lines: string[] = [];
  if (due > 0) {
    lines.push(
      `Tens ${cartoes} à espera de revisão — cinco minutos chegam para os despachar.`
    );
    if (streak >= 2) {
      lines.push(`E ${sequencia} continua contigo. Está a correr bem!`);
    }
  } else {
    lines.push(
      `${sequencia.charAt(0).toUpperCase()}${sequencia.slice(1)} está viva — cinco minutos hoje e continua a crescer.`
    );
  }

  const href = due > 0 ? `${site}/practice/rever` : site;
  const label = due > 0 ? "Rever agora" : "Continuar hoje";

  return sendEmail({
    to: input.to,
    kind: "reminder",
    subject,
    text: `Olá ${input.displayName}!\n\n${lines.join("\n")}\n\n${href}`,
    html: emailShell(
      `Olá, ${escapeHtml(input.displayName)}!`,
      lines
        .map(
          (l) =>
            `<p style="margin:0 0 8px;font-size:15px;line-height:1.6">${escapeHtml(l)}</p>`
        )
        .join("") + button(href, label)
    ),
  });
}

/**
 * The welcome message, sendable WITHOUT a session.
 *
 * The templated version in lib/actions/email.ts sits behind requireAdmin(),
 * which is right for an admin adding somebody — and useless at signup, where
 * the session cookie is only set once the route returns. So the one moment a
 * welcome email is most obviously wanted was the one moment it could not be
 * sent, and both templates sat in the codebase with zero call sites.
 *
 * Never contains a password. An emailed password is a password in a dozen
 * mailboxes forever.
 */
export async function sendWelcome(input: {
  to: string;
  username: string;
  displayName: string;
  familyName?: string;
}): Promise<void> {
  const site = process.env.SITE_URL ?? "https://port.robertjeremiah.com";
  try {
    await sendEmail({
      to: input.to,
      kind: "welcome",
      subject: "Bem-vindo(a) ao Português",
      text: `Olá ${input.displayName}!\n\n${
        input.familyName ? `A família ${input.familyName} já está criada. ` : ""
      }O teu nome de utilizador é ${input.username}.\n\n${site}`,
      html: emailShell(
        `Olá, ${escapeHtml(input.displayName)}!`,
        `<p style="margin:0;font-size:15px;line-height:1.6">${
          input.familyName
            ? `A família <strong>${escapeHtml(input.familyName)}</strong> já está criada. `
            : ""
        }O teu nome de utilizador é <strong>${escapeHtml(input.username)}</strong>.</p>
         <p style="margin:12px 0 0;font-size:15px;line-height:1.6">Podes convidar o resto da família a partir de Contas, no painel.</p>
         ${button(`${site}/login`, "Entrar")}`
      ),
    });
  } catch {
    // A signup must never fail because a mailbox was unreachable.
  }
}

/**
 * The magic-link sign-in email.
 *
 * Returns the real SendResult — deliberately NOT fire-and-forget like
 * sendWelcome(). The caller must know whether the link actually went out,
 * because a failed send has to void the token and tell the person; a link
 * that silently never arrives is indistinguishable from a broken app.
 *
 * The URL carries the only copy of the raw token that will ever exist, so it
 * goes into the message body and nowhere else — never into the email log,
 * never into an error.
 */
export async function sendMagicLinkEmail(input: {
  to: string;
  url: string;
}): Promise<SendResult> {
  return sendEmail({
    to: input.to,
    kind: "magic-link",
    subject: "O teu link para entrar",
    text: `Olá!\n\nClica neste link para entrares no Português:\n${input.url}\n\nÉ válido durante 15 minutos e só funciona uma vez.\n\nSe não pediste este email, podes simplesmente ignorá-lo.`,
    html: emailShell(
      "Olá!",
      `<p style="margin:0;font-size:15px;line-height:1.6">Clica no botão para entrares no Português. O link é válido durante <strong>15 minutos</strong> e só funciona uma vez.</p>
       ${button(input.url, "Entrar")}
       <p style="margin:12px 0 0;font-size:13px;line-height:1.6;color:#8a8378">Se não pediste este email, podes simplesmente ignorá-lo.</p>`
    ),
  });
}

/**
 * The family invite email. Same contract as sendMagicLinkEmail: the caller
 * gets the real result and voids the token on failure. Never a password —
 * the invitee chooses their own on the accept page.
 */
export async function sendInviteEmail(input: {
  to: string;
  url: string;
  familyName: string;
}): Promise<SendResult> {
  return sendEmail({
    to: input.to,
    kind: "invite",
    subject: `Um convite da família ${input.familyName}`,
    text: `Olá!\n\nA família ${input.familyName} convidou-te para aprender português europeu com ela.\n\nAceita o convite aqui:\n${input.url}\n\nO convite é válido durante 7 dias.`,
    html: emailShell(
      "Tens um convite! 🇵🇹",
      `<p style="margin:0;font-size:15px;line-height:1.6">A família <strong>${escapeHtml(input.familyName)}</strong> convidou-te para aprender português europeu com ela. Escolhes o teu nome e a tua palavra-passe quando aceitares.</p>
       ${button(input.url, "Aceitar o convite")}
       <p style="margin:12px 0 0;font-size:13px;line-height:1.6;color:#8a8378">O convite é válido durante 7 dias. Se não o esperavas, podes ignorar este email.</p>`
    ),
  });
}
