import { cache } from "react";
import { SignJWT, jwtVerify } from "jose";
import { eq, or, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION_COOKIE = "ph_session";
/** Distinguishes a login session from every other token signed with JWT_SECRET. */
const SESSION_AUDIENCE = "ph-session";
const SESSION_DAYS = 30;

export type Session = {
  username: string; // lowercase, e.g. "robert"
  displayName: string; // e.g. "Robert"
};

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export function getValidUsers(): string[] {
  const raw =
    process.env.VALID_USERS ??
    "Kelly,Jenni,Robert,Bobby,Sarah,Hannah,Rebecca,Sammy";
  return raw
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
}

/**
 * Sign-in, by username OR email.
 *
 * The database is authoritative when it can be read: an account there may have
 * its own password, may be deactivated, and may not appear in VALID_USERS at
 * all. An account with no password of its own still accepts the shared one, so
 * migrating to per-user passwords never locks anybody out mid-flight, and the
 * env list remains the last resort so a fresh deployment with an empty users
 * table (or an unreachable database) can still be signed into.
 */
export async function checkCredentials(
  identifier: string,
  password: string
): Promise<Session | null> {
  const id = identifier.trim().toLowerCase();
  if (!id || !password) return null;

  try {
    const { getDb, users } = await import("@/lib/db");
    const { verifyPassword, dummyVerify } = await import("@/lib/password");
    const [row] = await getDb()
      .select({
        username: users.username,
        displayName: users.displayName,
        passwordHash: users.passwordHash,
        active: users.active,
        email: users.email,
      })
      .from(users)
      .where(or(eq(users.username, id), sql`lower(${users.email}) = ${id}`))
      .limit(1);

    // Every branch below spends exactly one scrypt so response time never
    // reveals whether the account exists or has a personal password set.
    if (row?.passwordHash) {
      const ok = await verifyPassword(password, row.passwordHash);
      return ok && row.active
        ? { username: row.username, displayName: row.displayName }
        : null;
    }
    // No hash to check (unknown account, or a real one still on the shared
    // password): burn the equivalent scrypt cost, then do the cheap logic.
    await dummyVerify(password);
    if (row) {
      // No personal password set yet — the shared one still works for them.
      return row.active && sharedMatches(password)
        ? { username: row.username, displayName: row.displayName }
        : null;
    }
  } catch {
    // Database unreachable: fall through to the env list rather than locking
    // the whole family out of a working app.
  }

  const match = getValidUsers().find((u) => u.toLowerCase() === id);
  if (!match || !sharedMatches(password)) return null;
  return { username: match.toLowerCase(), displayName: match };
}

function sharedMatches(password: string): boolean {
  const shared = process.env.SHARED_PASSWORD;
  if (!shared) return false;
  return password === shared;
}

export async function createSessionToken(session: Session): Promise<string> {
  return new SignJWT({ name: session.displayName })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.username)
    .setAudience(SESSION_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string
): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub) return null;
    // A session must not be impersonated by another token signed with the same
    // secret. The Listen & Speak podcast feed mints a 90-day token with
    // aud="ls-feed" and sub=username, and that URL is SHOWN to the user to
    // paste into a podcast app — so without this check, leaking a feed URL
    // leaked a login. Tokens minted before this existed carry no aud and stay
    // valid so nobody is signed out; anything with a FOREIGN aud is rejected.
    if (payload.aud !== undefined && payload.aud !== SESSION_AUDIENCE) {
      return null;
    }
    return {
      username: payload.sub,
      displayName: (payload.name as string) ?? payload.sub,
    };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
};

/**
 * Does this session's account still exist, and is it still allowed in?
 *
 * A JWT is a bearer token: once signed it is good for its full 30 days and
 * nothing in it can be taken back. So deleting or deactivating a person did
 * NOT sign them out — their cookie kept working for a month. Worse, it was
 * invisible: householdUsernames() fails closed to "a household of one", so a
 * deleted account got a private, empty, entirely functional app instead of a
 * door in the face. "Apagar conta" has to mean it immediately.
 *
 * Fails OPEN on a database error. A Neon blip must never sign the whole
 * family out; only a definitive answer ends a session.
 *
 * cache() keeps it to one lookup per request no matter how many callers ask.
 */
const accountStillValid = cache(async (username: string): Promise<boolean> => {
  try {
    const { getDb, users } = await import("@/lib/db");
    const [row] = await getDb()
      .select({ active: users.active })
      .from(users)
      .where(eq(users.username, username.toLowerCase()))
      .limit(1);
    // No row can mean two things, and only one of them is a live session.
    //
    // Do NOT resolve it against VALID_USERS. That list defaults to the eight
    // original family names — the very accounts since deleted — so consulting
    // it would keep exactly the ghosts this check exists to evict. The only
    // honest bootstrap signal is a users table with nobody in it at all: a
    // fresh deployment, where the env list IS the identity.
    if (!row) {
      const [count] = await getDb()
        .select({ n: sql<number>`count(*)::int` })
        .from(users);
      return Number(count?.n ?? 0) === 0;
    }
    return row.active;
  } catch {
    return true;
  }
});

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  if (!session) return null;
  return (await accountStillValid(session.username)) ? session : null;
}

/** For pages/actions that require login; redirects to /login when absent. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** Roles are derived from env at runtime (no re-login needed to change them):
 *  ADMIN_USERS (default Robert) · TEACHER_USERS (default Kelly). */
export type Role = "admin" | "teacher" | "student";

function envList(name: string, fallback: string): string[] {
  return (process.env[name] ?? fallback)
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export const ROLES: readonly Role[] = ["admin", "teacher", "student"];

/** The env-list answer. Used when the database has no opinion. */
export function envRole(username: string): Role {
  const u = username.toLowerCase();
  if (envList("ADMIN_USERS", "Robert").includes(u)) return "admin";
  if (envList("TEACHER_USERS", "Kelly").includes(u)) return "teacher";
  return "student";
}

/**
 * The role that actually applies: whatever an admin set on the account, else
 * the env lists. Stored roles win so the admin panel can promote and demote
 * without a redeploy, but ADMIN_USERS stays a working recovery hatch — the
 * person named there is an admin even if the row says otherwise.
 */
export async function roleOf(username: string): Promise<Role> {
  const fromEnv = envRole(username);
  if (fromEnv === "admin") return "admin";
  try {
    const { getDb, users } = await import("@/lib/db");
    const [row] = await getDb()
      .select({ role: users.role })
      .from(users)
      .where(eq(users.username, username.toLowerCase()))
      .limit(1);
    const stored = row?.role ?? "";
    return (ROLES as readonly string[]).includes(stored)
      ? (stored as Role)
      : fromEnv;
  } catch {
    return fromEnv;
  }
}

/**
 * Admin or teacher only; students are sent home.
 *
 * A PLATFORM OPERATOR passes regardless of role. Operator accounts carry role
 * "student" on purpose — "admin" means "runs a household" and an operator has
 * none — so without this check the person who runs the deployment would be
 * turned away from its own admin panel.
 */
export async function requireStaff(): Promise<Session & { role: Role }> {
  const session = await requireSession();
  const role = await roleOf(session.username);
  if (role === "student" && !(await isOperator(session.username))) redirect("/");
  return { ...session, role };
}

/** Staff or operator — for showing a panel link, not for gating data. */
export async function canSeePanel(username: string): Promise<boolean> {
  return (await roleOf(username)) !== "student" || (await isOperator(username));
}

/** Admin only. Used by the destructive account-management actions. */
export async function requireAdmin(): Promise<Session> {
  const session = await requireSession();
  if ((await roleOf(session.username)) !== "admin") redirect("/");
  return session;
}

/**
 * The INSTANCE operator — the person who runs the deployment.
 *
 * The distinction from requireAdmin() is load-bearing and easy to miss.
 * `roleOf()` reads users.role, and /registar sets role "admin" on whoever
 * creates a family, because they administer THEIR household. That means every
 * self-registered family owner satisfies requireAdmin(), which is correct for
 * their own family and catastrophic for anything instance-wide: it was enough
 * to reach every household's spend report.
 *
 * Only ADMIN_USERS gets past this. Use it for any surface that reads across
 * households — system stats, all-content views, revenue reporting.
 */
export async function requireOperator(): Promise<Session> {
  const session = await requireSession();
  if (!(await isOperator(session.username))) redirect("/");
  return session;
}

/**
 * Is this a PLATFORM operator?
 *
 * Two sources, and both are needed. The ADMIN_USERS env list is the bootstrap
 * — it exists before any database row does, and is how the first operator
 * ever signs in. users.is_operator is the real thing: an account, creatable
 * and revocable without a redeploy, belonging to no family.
 *
 * Never `roleOf`. That returns "admin" for every family owner, because
 * /registar makes them one for their own household.
 *
 * cache(): the layout, the dashboard and every gate ask this about the same
 * session in one render. is_operator is only ever written by a CLI script,
 * so within a request the answer cannot change.
 */
export const isOperator = cache(async (username: string): Promise<boolean> => {
  if (envRole(username) === "admin") return true;
  try {
    const { getDb, users } = await import("@/lib/db");
    const [row] = await getDb()
      .select({ op: users.isOperator })
      .from(users)
      .where(eq(users.username, username.toLowerCase()))
      .limit(1);
    return row?.op === true;
  } catch {
    // A database blip must never silently promote anyone.
    return false;
  }
});
