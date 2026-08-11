import { NextResponse, type NextRequest } from "next/server";
import { eq, or, sql } from "drizzle-orm";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";
import { accounts, getDb, memberships, people, users } from "@/lib/db";
import { hashPassword, passwordProblem } from "@/lib/password";
import { planById } from "@/lib/plans";
import { verifyTurnstile } from "@/lib/turnstile";
import { logActivity } from "@/lib/data";

/**
 * Sign a new family up.
 *
 * This is the front door the app did not have: every account until now was
 * created by an admin, so a stranger could not become a customer at all.
 *
 * One request creates the whole household — account, person, user, membership
 * — and signs the owner in, because a signup that leaves you at a login form
 * is a signup that loses half the people who finished it.
 */

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 5;
const attempts = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  attempts.set(ip, recent);
  if (attempts.size > 1000) {
    for (const [k, v] of attempts) {
      if (v.every((t) => now - t >= WINDOW_MS)) attempts.delete(k);
    }
  }
  return recent.length > MAX_PER_IP;
}

const RESERVED = new Set([
  "admin", "api", "login", "logout", "registar", "signup", "practice",
  "unidades", "homework", "quizzes", "reference", "familia", "placement",
  "stories", "escutar", "jogos", "missoes", "tutor", "notes", "workbook",
  "verbos", "ouvir", "gastos", "me", "new", "bem-vindo", "null", "undefined",
]);

/** "Família Silva" -> "familia-silva", uniquified if taken. */
function slugify(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "familia"
  );
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Demasiadas contas criadas. Tenta daqui a pouco." },
      { status: 429 }
    );
  }

  let body: {
    familyName?: string;
    displayName?: string;
    username?: string;
    email?: string;
    password?: string;
    turnstileToken?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  if (!(await verifyTurnstile(body.turnstileToken))) {
    return NextResponse.json(
      { error: "A verificação anti-robô falhou. Tenta outra vez." },
      { status: 403 }
    );
  }

  const familyName = String(body.familyName ?? "").trim().slice(0, 60);
  const displayName = String(body.displayName ?? "").trim().slice(0, 60);
  const username = String(body.username ?? "").trim().toLowerCase();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!familyName) return bad("Falta o nome da família.");
  if (!displayName) return bad("Falta o teu nome.");
  if (!/^[a-z0-9][a-z0-9._-]{1,31}$/.test(username)) {
    return bad("Nome de utilizador: 2-32 caracteres, letras minúsculas e números.");
  }
  if (RESERVED.has(username)) return bad("Esse nome de utilizador está reservado.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return bad("Email inválido.");
  }
  const pw = passwordProblem(password);
  if (pw) return bad(pw);

  const db = getDb();

  // Check both identifiers up front: "that name is taken" is a far better
  // first experience than a database constraint error.
  const clash = await db
    .select({ username: users.username })
    .from(users)
    .where(
      email
        ? or(eq(users.username, username), sql`lower(${users.email}) = ${email}`)
        : eq(users.username, username)
    )
    .limit(1);
  if (clash.length > 0) {
    return bad("Esse nome de utilizador ou email já está a ser usado.");
  }

  // Unique household slug.
  let slug = slugify(familyName);
  for (let i = 2; i < 50; i++) {
    const [taken] = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.slug, slug))
      .limit(1);
    if (!taken) break;
    slug = `${slugify(familyName)}-${i}`;
  }

  try {
    const [account] = await db
      .insert(accounts)
      // Seats come from the plan, so changing the plan cannot silently
      // leave new families on an old seat count.
      .values({ slug, name: familyName, plan: "family", seatLimit: planById("family").seats })
      .returning({ id: accounts.id });

    const [person] = await db
      .insert(people)
      .values({ displayName, email: email || null })
      .returning({ id: people.id });

    await db.insert(users).values({
      username,
      displayName,
      email: email || null,
      passwordHash: await hashPassword(password),
      // The person who creates the household runs it.
      role: "admin",
      mode: "simple",
    });

    await db.insert(memberships).values({
      accountId: account.id,
      personId: person.id,
      username,
      role: "owner",
    });

    await logActivity(username, "review", `Família criada: ${familyName}`, 0).catch(
      () => {}
    );
  } catch {
    return NextResponse.json(
      { error: "Não foi possível criar a conta. Tenta outra vez." },
      { status: 500 }
    );
  }

  // Sign them straight in — the next screen is the assessment, not a login box.
  const token = await createSessionToken({ username, displayName });
  const res = NextResponse.json({ ok: true, next: "/bem-vindo" });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}

function bad(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}
