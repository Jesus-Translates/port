import { NextResponse, type NextRequest } from "next/server";
import { eq, or, sql } from "drizzle-orm";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";
import { accounts, getDb, memberships, people, subscriptions, users } from "@/lib/db";
import { hashPassword, passwordProblem } from "@/lib/password";
import { guaranteeDays, planById } from "@/lib/plans";
import { verifyTurnstile } from "@/lib/turnstile";
import { usernameProblem } from "@/lib/username";
import { logActivity } from "@/lib/data";
import { sendWelcome } from "@/lib/email";

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
  const nameProblem = usernameProblem(username);
  if (nameProblem) return bad(nameProblem);
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

  /*
   * Five inserts, no transaction — neon-http has none.
   *
   * Uniqueness is checked above and enforced by a constraint below, so two
   * simultaneous signups for the same username both pass the check and one
   * fails at the users insert. Without cleanup that left an orphaned account
   * and person behind, and burned the family slug, forever. Track what we
   * created so the catch can undo it.
   */
  let newAccountId: number | null = null;
  let newPersonId: number | null = null;

  try {
    const [account] = await db
      .insert(accounts)
      // Seats come from the plan, so changing the plan cannot silently
      // leave new families on an old seat count.
      .values({ slug, name: familyName, plan: "family", seatLimit: planById("family").seats })
      .returning({ id: accounts.id });
    newAccountId = account.id;

    const [person] = await db
      .insert(people)
      .values({ displayName, email: email || null })
      .returning({ id: people.id });
    newPersonId = person.id;

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

    /*
     * Start the money-back clock at signup.
     *
     * The guarantee only means anything if its deadline is a real stored date
     * rather than a sentence on a marketing page — otherwise "five days" is
     * whatever the operator remembers when someone asks. Recorded here, shown
     * on /conta, and enforced by requestRefund().
     *
     * Status is "trialing" and there is no Stripe id yet: payment collection
     * is the one part of this flow still to be wired, and pretending otherwise
     * in the data would be worse than an honest gap.
     */
    const guaranteeEndsAt = new Date(
      Date.now() + guaranteeDays() * 24 * 60 * 60 * 1000
    );
    await db
      .insert(subscriptions)
      .values({
        accountId: account.id,
        status: "trialing",
        guaranteeEndsAt,
      })
      .onConflictDoNothing();

    // Welcome them. Fire-and-forget by construction (sendWelcome swallows its
    // own failures) — a signup must never fail because Resend was down.
    if (email) {
      void sendWelcome({ to: email, username, displayName, familyName });
    }

    await logActivity(username, "review", `Família criada: ${familyName}`, 0).catch(
      () => {}
    );
  } catch {
    // Best effort, and deliberately silent: the customer's answer is the same
    // either way, and a failed cleanup must not mask the original failure.
    try {
      if (newPersonId !== null) {
        await db.delete(people).where(eq(people.id, newPersonId));
      }
      if (newAccountId !== null) {
        await db.delete(accounts).where(eq(accounts.id, newAccountId));
      }
    } catch {
      // Nothing more we can do from here.
    }
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
