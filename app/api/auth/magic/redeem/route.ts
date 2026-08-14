import { NextResponse, type NextRequest } from "next/server";
import { sql } from "drizzle-orm";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";
import { getDb, users } from "@/lib/db";
import { claimAuthToken } from "@/lib/auth-tokens";

/**
 * The link in the email lands here. Public by design (proxy.ts) — the whole
 * point is that the person is signed out.
 *
 * The claim is a single UPDATE guarded on `used_at IS NULL` and the expiry
 * (lib/auth-tokens.ts): a double-click races two copies of that statement and
 * Postgres lets exactly one change the row. The loser — like an expired,
 * already-used, or made-up token — gets the same silent redirect to /login,
 * with a query flag the form turns into one non-specific message. Nothing
 * here ever says WHY a link did not work, and no token ever appears in a
 * response, a log line, or a redirect target.
 */
export async function GET(request: NextRequest) {
  const fail = () =>
    NextResponse.redirect(new URL("/login?erro=link", request.nextUrl));

  const raw = request.nextUrl.searchParams.get("t") ?? "";
  const claimed = await claimAuthToken(raw, "magic").catch(() => null);
  if (!claimed?.email) return fail();

  // Resolve the address at redemption time — the account may have been
  // renamed, deactivated, or deleted in the fifteen minutes since the email
  // went out, and the token must not outrank any of that.
  let row: { username: string; displayName: string; active: boolean } | undefined;
  try {
    [row] = await getDb()
      .select({
        username: users.username,
        displayName: users.displayName,
        active: users.active,
      })
      .from(users)
      .where(sql`lower(${users.email}) = ${claimed.email}`)
      .limit(1);
  } catch {
    return fail();
  }
  if (!row || !row.active) return fail();

  // The SAME 30-day session a password sign-in mints — not a special one.
  const token = await createSessionToken({
    username: row.username,
    displayName: row.displayName,
  });
  const res = NextResponse.redirect(new URL("/", request.nextUrl));
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}
