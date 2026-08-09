import { NextResponse, type NextRequest } from "next/server";
import {
  checkCredentials,
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";
import { verifyTurnstile } from "@/lib/turnstile";

// Per-instance sliding-window limiter: 10 attempts / 5 min / IP. Plenty for a
// three-person family, hostile to password guessing.
const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const attempts = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  attempts.set(ip, recent);
  if (attempts.size > 1000) {
    for (const [key, times] of attempts) {
      if (times.every((t) => now - t >= WINDOW_MS)) attempts.delete(key);
    }
  }
  return recent.length > MAX_ATTEMPTS;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Demasiadas tentativas. Espera uns minutos." },
      { status: 429 }
    );
  }

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

  const session = await checkCredentials(
    body.username ?? "",
    body.password ?? ""
  );
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
