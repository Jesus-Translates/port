import { NextResponse, type NextRequest } from "next/server";
import { sql } from "drizzle-orm";
import { getDb, users } from "@/lib/db";
import { verifyTurnstile } from "@/lib/turnstile";
import {
  createAuthToken,
  MAGIC_TTL_MS,
  voidAuthToken,
} from "@/lib/auth-tokens";
import { emailConfigured, sendMagicLinkEmail } from "@/lib/email";

/**
 * "Email me a sign-in link."
 *
 * The enumeration defence lives HERE, and it is the point of this route:
 * whether the address has an account, has no account, or belongs to a
 * deactivated one, the caller gets the SAME 200 and the same response body.
 * To keep the timing side-channel shut too, every request that reaches the
 * lookup waits out the same floor before answering — the work an unknown
 * address skips (token mint, Resend call) is exactly what the floor hides.
 */

// Same in-memory shape as /api/auth/signup. NOTE: per-instance on Vercel —
// each warm lambda has its own map, so a determined attacker gets a multiple
// of these numbers. That is understood: Turnstile is the real gate against
// automation; this exists to blunt casual abuse and inbox-bombing.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 10;
const MAX_PER_EMAIL = 4;
const byIp = new Map<string, number[]>();
const byEmail = new Map<string, number[]>();

function rateLimited(map: Map<string, number[]>, key: string, max: number): boolean {
  const now = Date.now();
  const recent = (map.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  map.set(key, recent);
  if (map.size > 1000) {
    for (const [k, v] of map) {
      if (v.every((t) => now - t >= WINDOW_MS)) map.delete(k);
    }
  }
  return recent.length > max;
}

/**
 * Every answer past the shape checks leaves at the same time. The floor is
 * generous compared to a typical lookup + Resend round-trip, so the known and
 * unknown branches are indistinguishable from outside. (A pathologically slow
 * send can exceed it; that residual noise is indistinguishable from ordinary
 * serverless jitter.)
 */
const FLOOR_MS = 1500;
async function floor(started: number): Promise<void> {
  const left = FLOOR_MS - (Date.now() - started);
  if (left > 0) await new Promise((r) => setTimeout(r, left));
}

export async function POST(request: NextRequest) {
  const started = Date.now();
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  let body: { email?: string; turnstileToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  // Shape-only checks: they reveal nothing about any account.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (rateLimited(byIp, ip, MAX_PER_IP) || rateLimited(byEmail, email, MAX_PER_EMAIL)) {
    return NextResponse.json(
      { error: "Too many requests. Wait a little and try again." },
      { status: 429 }
    );
  }
  if (!(await verifyTurnstile(body.turnstileToken))) {
    return NextResponse.json(
      { error: "The anti-robot check failed. Please try again." },
      { status: 403 }
    );
  }
  // Identical for every address — configuration is not account knowledge.
  if (!emailConfigured()) {
    return NextResponse.json(
      { error: "Email sign-in is not available right now. Use your password." },
      { status: 503 }
    );
  }

  // From here on, every path answers after the same floor, with the same body.
  try {
    const [row] = await getDb()
      .select({ active: users.active })
      .from(users)
      .where(sql`lower(${users.email}) = ${email}`)
      .limit(1);

    // A deactivated account is treated exactly like an unknown one.
    if (row?.active) {
      const raw = await createAuthToken({
        kind: "magic",
        email,
        ttlMs: MAGIC_TTL_MS,
      });
      const site = process.env.SITE_URL ?? "https://port.robertjeremiah.com";
      // The raw token's only home: this URL, in this email. Never logged,
      // never returned to the caller.
      const sent = await sendMagicLinkEmail({
        to: email,
        url: `${site}/api/auth/magic/redeem?t=${raw}`,
      });
      if (!sent.ok) {
        // Destroy the token — a link we could not deliver must not exist.
        //
        // And then answer exactly like everyone else. Reporting the failure
        // would be more honest but it is an ORACLE: this branch is reachable
        // only for a KNOWN ACTIVE address, because an unknown one never calls
        // the provider at all. A 503 here therefore means "this address has an
        // account", and an attacker who waits for a provider outage can
        // enumerate the whole customer list through it.
        //
        // The honesty cost is bounded: the password path still works, and the
        // screen already tells people to request another link. The security
        // cost of the alternative is not bounded.
        await voidAuthToken(raw).catch(() => {});
      }
    }
  } catch {
    // A database blip must not become an oracle; answer like everyone else.
  }

  await floor(started);
  // The ONE answer: known, unknown, deactivated, and undeliverable alike.
  // Any branch that returns something different here is an account oracle.
  return NextResponse.json({ ok: true });
}
