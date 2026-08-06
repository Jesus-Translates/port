import { NextResponse, type NextRequest } from "next/server";
import {
  checkCredentials,
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";
import { verifyTurnstile } from "@/lib/turnstile";

export async function POST(request: NextRequest) {
  let body: { username?: string; password?: string; turnstileToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const human = await verifyTurnstile(body.turnstileToken);
  if (!human) {
    return NextResponse.json(
      { error: "Verificação anti-robô falhou. Tenta outra vez." },
      { status: 403 }
    );
  }

  const session = checkCredentials(body.username ?? "", body.password ?? "");
  if (!session) {
    return NextResponse.json(
      { error: "Nome ou palavra-passe errados. Tenta outra vez!" },
      { status: 401 }
    );
  }

  const token = await createSessionToken(session);
  const res = NextResponse.json({ ok: true, displayName: session.displayName });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}
