import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION_COOKIE = "ph_session";
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

export function checkCredentials(
  username: string,
  password: string
): Session | null {
  const shared = process.env.SHARED_PASSWORD;
  if (!shared) throw new Error("SHARED_PASSWORD is not set");
  const match = getValidUsers().find(
    (u) => u.toLowerCase() === username.trim().toLowerCase()
  );
  if (!match || password !== shared) return null;
  return { username: match.toLowerCase(), displayName: match };
}

export async function createSessionToken(session: Session): Promise<string> {
  return new SignJWT({ name: session.displayName })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.username)
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

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
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

export function getRole(username: string): Role {
  const u = username.toLowerCase();
  if (envList("ADMIN_USERS", "Robert").includes(u)) return "admin";
  if (envList("TEACHER_USERS", "Kelly").includes(u)) return "teacher";
  return "student";
}

/** Admin or teacher only; students are sent home. */
export async function requireStaff(): Promise<Session & { role: Role }> {
  const session = await requireSession();
  const role = getRole(session.username);
  if (role === "student") redirect("/");
  return { ...session, role };
}
