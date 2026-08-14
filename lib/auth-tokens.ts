import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { authTokens, getDb } from "@/lib/db";

/**
 * Single-use, short-lived tokens: magic-link sign-in and family invites.
 *
 * The security model, in one place:
 *
 * - The raw token is 32 bytes from crypto.randomBytes, base64url — 256 bits of
 *   entropy. It exists ONLY inside the emailed URL; it is never stored, never
 *   logged, never echoed back in a response or an error.
 * - The database holds sha256(raw) alone. Someone who can read the table holds
 *   nothing redeemable: sha256 of a 256-bit random value cannot be reversed or
 *   guessed, and the raw token cannot be reconstructed from the hash.
 * - Matching is a LOOKUP BY HASH, not a comparison. There is no equality check
 *   over secret material anywhere, so there is nothing to do in constant time.
 * - Single use is enforced by the database, not by a read-then-write: claiming
 *   is one UPDATE guarded on `used_at IS NULL` that reports whether it changed
 *   a row. Two racing redemptions serialise on the row lock; exactly one wins.
 * - Expiry is checked inside the same guarded UPDATE, against the database at
 *   the moment of the claim.
 */

export const MAGIC_TTL_MS = 15 * 60 * 1000; // 15 minutes
export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** 32 bytes base64url is exactly 43 chars. Anything else is not our token. */
const RAW_SHAPE = /^[A-Za-z0-9_-]{43}$/;

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export type TokenKind = "invite" | "magic";

/**
 * Mint a token and store only its hash. Returns the raw token exactly once —
 * the caller puts it in an email URL and forgets it.
 *
 * Earlier UNUSED tokens of the same kind for the same address (and household,
 * for invites) are deleted first: newest wins, at most one live link per
 * (kind, email) exists, and the table cannot grow with every impatient click
 * of "send again".
 */
export async function createAuthToken(input: {
  kind: TokenKind;
  email: string;
  accountId?: number | null;
  role?: "parent" | "child" | null;
  ttlMs: number;
}): Promise<string> {
  const raw = randomBytes(32).toString("base64url");
  const db = getDb();

  await db
    .delete(authTokens)
    .where(
      and(
        eq(authTokens.kind, input.kind),
        eq(authTokens.email, input.email),
        isNull(authTokens.usedAt),
        input.accountId != null
          ? eq(authTokens.accountId, input.accountId)
          : undefined
      )
    );

  await db.insert(authTokens).values({
    kind: input.kind,
    email: input.email,
    accountId: input.accountId ?? null,
    role: input.role ?? null,
    tokenHash: hashToken(raw),
    expiresAt: new Date(Date.now() + input.ttlMs),
  });

  return raw;
}

export type ClaimedToken = {
  id: number;
  email: string | null;
  accountId: number | null;
  role: string | null;
};

/**
 * Redeem a token — atomically. ONE UPDATE, guarded on `used_at IS NULL` and
 * the expiry, returning the row it claimed. A double-click, a second tab, or
 * two hostile parallel requests all run the same statement; Postgres serialises
 * them on the row, the first sets used_at, and every later one matches zero
 * rows and gets null. There is no window between "check" and "mark".
 */
export async function claimAuthToken(
  raw: string,
  kind: TokenKind
): Promise<ClaimedToken | null> {
  if (!RAW_SHAPE.test(raw)) return null;
  const rows = await getDb()
    .update(authTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(authTokens.tokenHash, hashToken(raw)),
        eq(authTokens.kind, kind),
        isNull(authTokens.usedAt),
        gt(authTokens.expiresAt, new Date())
      )
    )
    .returning({
      id: authTokens.id,
      email: authTokens.email,
      accountId: authTokens.accountId,
      role: authTokens.role,
    });
  return rows[0] ?? null;
}

export type TokenPeek =
  | { status: "unknown" }
  | { status: "used" }
  | { status: "expired" }
  | {
      status: "ok";
      id: number;
      email: string | null;
      accountId: number | null;
      role: string | null;
    };

/**
 * Look WITHOUT redeeming — for rendering the invite page. Never treat "ok"
 * here as permission to act; only claimAuthToken() grants that, atomically.
 */
export async function peekAuthToken(
  raw: string,
  kind: TokenKind
): Promise<TokenPeek> {
  if (!RAW_SHAPE.test(raw)) return { status: "unknown" };
  const [row] = await getDb()
    .select()
    .from(authTokens)
    .where(
      and(eq(authTokens.tokenHash, hashToken(raw)), eq(authTokens.kind, kind))
    )
    .limit(1);
  if (!row) return { status: "unknown" };
  if (row.usedAt) return { status: "used" };
  if (row.expiresAt.getTime() <= Date.now()) return { status: "expired" };
  return {
    status: "ok",
    id: row.id,
    email: row.email,
    accountId: row.accountId,
    role: row.role,
  };
}

/**
 * Destroy a token whose email never went out. A failed send must not leave a
 * working link in nobody's inbox — if we could not deliver it, it must not
 * exist.
 */
export async function voidAuthToken(raw: string): Promise<void> {
  if (!RAW_SHAPE.test(raw)) return;
  await getDb()
    .delete(authTokens)
    .where(eq(authTokens.tokenHash, hashToken(raw)));
}

/**
 * Un-claim after a claim whose follow-up work failed (an invite claimed, then
 * the username turned out to be taken). Only ever called with an id that
 * claimAuthToken just returned, and only when nothing was created — otherwise
 * a burnt invite would punish the invitee for a name collision.
 */
export async function releaseAuthToken(id: number): Promise<void> {
  await getDb()
    .update(authTokens)
    .set({ usedAt: null })
    .where(eq(authTokens.id, id));
}
