"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { asc, eq, inArray, sql } from "drizzle-orm";
import {
  envRole,
  requireSession,
  roleOf,
  type Role,
} from "@/lib/auth";
import { accounts, getDb, memberships, people, users } from "@/lib/db";
import {
  adoptIntoHousehold,
  currentAccountId,
  householdUsernames,
  orphanUsernames,
} from "@/lib/tenant";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/password";
import { logActivity } from "@/lib/data";

/**
 * Account management for the admin panel.
 *
 * Every export here is a network-callable endpoint, so each one re-checks the
 * caller's role rather than trusting a parameter — the admin-only ones start
 * with requireAdmin(), and the self-service one derives its target from the
 * session instead of accepting a username.
 */

export type Account = {
  username: string;
  displayName: string;
  email: string | null;
  role: Role;
  mode: string;
  active: boolean;
  hasOwnPassword: boolean;
  createdAt: string;
};

const ROLE_VALUES: readonly Role[] = ["admin", "teacher", "student"];
const MODES = ["simple", "full"];
/** Route segments and reserved words a username must never shadow. */
const RESERVED = new Set([
  "admin", "api", "login", "logout", "practice", "unidades", "homework",
  "quizzes", "livro", "familia", "placement", "stories", "escutar", "jogos",
  "missoes", "tutor", "notes", "workbook", "verbos", "ouvir", "gastos", "me",
  "new", "null", "undefined",
]);

/**
 * Who may manage accounts, and whose.
 *
 * Two different jobs wear the same word. The person in ADMIN_USERS runs the
 * INSTANCE and can see every household — that is the recovery hatch. A family's
 * own admin runs THEIR household and must never see another one; without this
 * distinction, "let a family admin add members" would hand every customer the
 * keys to every other customer.
 */
type ManageScope = {
  username: string;
  /** Instance operator: sees and edits every household. */
  superadmin: boolean;
  /** The household being managed, null only for a superadmin with no membership. */
  accountId: number | null;
};

async function manageScope(): Promise<ManageScope> {
  const session = await requireSession();
  const superadmin = envRole(session.username) === "admin";
  const accountId = await currentAccountId();

  if (superadmin) return { username: session.username, superadmin, accountId };

  // A household admin: either the app role, or owner/parent of the household.
  const role = await roleOf(session.username);
  let householdRole = "";
  if (accountId !== null) {
    const [row] = await getDb()
      .select({ role: memberships.role })
      .from(memberships)
      .where(eq(memberships.username, session.username))
      .limit(1);
    householdRole = row?.role ?? "";
  }
  const allowed =
    role === "admin" || householdRole === "owner" || householdRole === "parent";
  if (!allowed) redirect("/");

  return { username: session.username, superadmin: false, accountId };
}

/** May this scope touch that account? Household admins are boxed in. */
async function canTouch(scope: ManageScope, target: string): Promise<boolean> {
  if (scope.superadmin) return true;
  return (await householdUsernames()).includes(target);
}

function cleanUsername(input: unknown): string {
  return String(input ?? "").trim().toLowerCase();
}

/**
 * Table names must be interpolated to build the rename/delete CTEs, so the
 * username interpolated beside them has to be provably inert first. Anything
 * that is not plain [a-z0-9._-] never reaches a SQL string.
 */
function isSafeName(username: string): boolean {
  return /^[a-z0-9][a-z0-9._-]{1,31}$/.test(username);
}

/** Shared shape rules, so create and rename cannot disagree about what is legal. */
function usernameProblem(username: string): string | null {
  if (username.length < 2) return "O nome de utilizador é demasiado curto.";
  if (username.length > 32) return "O nome de utilizador é demasiado longo.";
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(username)) {
    return "Só letras minúsculas, números, ponto, hífen e underscore.";
  }
  if (RESERVED.has(username)) return "Esse nome está reservado.";
  return null;
}

function cleanEmail(input: unknown): string | null {
  const s = String(input ?? "").trim().toLowerCase();
  if (!s) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) || s.length > 200) return "";
  return s;
}

export async function listAccounts(): Promise<Account[]> {
  const scope = await manageScope();
  // A household admin sees their own people. The instance admin sees
  // everyone INCLUDING anyone with no household — those are exactly the
  // accounts that go missing, so the roster is where they must show up.
  const mine = scope.superadmin
    ? null
    : [...(await householdUsernames()), ...(await orphanUsernames())];
  const rows = await getDb()
    .select({
      username: users.username,
      displayName: users.displayName,
      email: users.email,
      role: users.role,
      mode: users.mode,
      active: users.active,
      passwordHash: users.passwordHash,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(mine ? inArray(users.username, mine) : undefined)
    .orderBy(asc(users.username));

  return Promise.all(
    rows.map(async (r) => ({
      username: r.username,
      displayName: r.displayName,
      email: r.email,
      role: await roleOf(r.username),
      mode: r.mode,
      active: r.active,
      hasOwnPassword: Boolean(r.passwordHash),
      createdAt: new Date(r.createdAt).toISOString().slice(0, 10),
    }))
  );
}

/** How many people can still administer this app. Guards every demotion. */
async function adminCount(excluding?: string): Promise<number> {
  const rows = await getDb()
    .select({ username: users.username, role: users.role, active: users.active })
    .from(users);
  return rows.filter((r) => {
    if (excluding && r.username === excluding) return false;
    if (!r.active) return false;
    // Same precedence as roleOf, resolved from rows already in hand.
    return envRole(r.username) === "admin" || r.role === "admin";
  }).length;
}

export async function createAccount(input: {
  displayName: string;
  username: string;
  email?: string;
  password?: string;
  role?: string;
  /**
   * Put the new person in THIS household instead of the caller's.
   *
   * Instance operators only. Without it, a family created in /admin/familias
   * could only ever be filled by creating someone in your own household and
   * then moving them — two steps and a moment where a stranger's child sits
   * in your family. A household admin passing this is ignored, not obeyed.
   */
  accountId?: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const scope = await manageScope();
  const username = cleanUsername(input.username);
  const displayName = String(input.displayName ?? "").trim().slice(0, 60);
  if (!displayName) return { ok: false, error: "Falta o nome." };

  const bad = usernameProblem(username);
  if (bad) return { ok: false, error: bad };

  const email = cleanEmail(input.email);
  if (email === "") return { ok: false, error: "Email inválido." };

  const role = ROLE_VALUES.includes(input.role as Role)
    ? (input.role as Role)
    : "student";

  let passwordHash: string | null = null;
  if (input.password) {
    const pw = passwordProblem(input.password);
    if (pw) return { ok: false, error: pw };
    passwordHash = await hashPassword(input.password);
  }

  const db = getDb();
  const [existing] = await db
    .select({ username: users.username })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  if (existing) return { ok: false, error: "Esse nome de utilizador já existe." };

  // A new person must JOIN a household, not float free. Without the
  // membership row they would be a household of one — invisible on the family
  // board, unassignable homework, and counted against nobody's seats.
  const accountId =
    scope.superadmin && Number.isInteger(input.accountId) && Number(input.accountId) > 0
      ? Number(input.accountId)
      : scope.accountId;
  if (accountId === null) {
    return {
      ok: false,
      error: "A tua conta ainda não pertence a uma família — corre db:backfill.",
    };
  }

  const [account] = await db
    .select({ seatLimit: accounts.seatLimit, name: accounts.name })
    .from(accounts)
    .where(eq(accounts.id, accountId))
    .limit(1);
  const taken = (
    await db
      .select({ username: memberships.username })
      .from(memberships)
      .where(eq(memberships.accountId, accountId))
  ).length;
  if (account && taken >= account.seatLimit) {
    return {
      ok: false,
      error: `O plano ${account.name} tem ${account.seatLimit} lugares e já estão todos ocupados.`,
    };
  }

  try {
    await db.insert(users).values({
      username,
      displayName,
      email,
      passwordHash,
      role,
      // New accounts start guided; they can switch once they find their feet.
      mode: "simple",
    });
    const [person] = await db
      .insert(people)
      .values({ displayName, email })
      .returning({ id: people.id });
    await db.insert(memberships).values({
      accountId,
      personId: person.id,
      username,
      role: role === "student" ? "child" : "parent",
    });
  } catch {
    return { ok: false, error: "Não foi possível criar a conta (email repetido?)." };
  }

  revalidatePath("/admin/utilizadores");
  return { ok: true };
}

export async function setAccountPassword(
  username: string,
  password: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const scope = await manageScope();
  const bad = passwordProblem(password);
  if (bad) return { ok: false, error: bad };
  const target = cleanUsername(username);
  if (!(await canTouch(scope, target))) {
    return { ok: false, error: "Essa pessoa não é da tua família." };
  }


  const hash = await hashPassword(password);
  const rows = await getDb()
    .update(users)
    .set({ passwordHash: hash })
    .where(eq(users.username, target))
    .returning({ username: users.username });
  if (rows.length === 0) return { ok: false, error: "Conta não encontrada." };

  revalidatePath("/admin/utilizadores");
  return { ok: true };
}

/**
 * Drop an account back to the shared password. The escape hatch for "I set a
 * password for my kid and we both forgot it".
 */
export async function clearAccountPassword(
  username: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const scope = await manageScope();
  const who = cleanUsername(username);
  if (!(await canTouch(scope, who))) {
    return { ok: false, error: "Essa pessoa não é da tua família." };
  }

  await getDb()
    .update(users)
    .set({ passwordHash: null })
    .where(eq(users.username, who));
  revalidatePath("/admin/utilizadores");
  return { ok: true };
}

/** Self-service: change your OWN password, proving you know the current one. */
export async function changeMyPassword(
  current: string,
  next: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  const bad = passwordProblem(next);
  if (bad) return { ok: false, error: bad };

  const db = getDb();
  const [row] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.username, session.username))
    .limit(1);
  if (!row) return { ok: false, error: "Conta não encontrada." };

  // Someone still on the shared password proves it the same way they log in.
  const ok = row.passwordHash
    ? await verifyPassword(current, row.passwordHash)
    : current === process.env.SHARED_PASSWORD;
  if (!ok) return { ok: false, error: "A palavra-passe atual não está certa." };

  await db
    .update(users)
    .set({ passwordHash: await hashPassword(next) })
    .where(eq(users.username, session.username));
  return { ok: true };
}

export async function setAccountEmail(
  username: string,
  email: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const scope = await manageScope();
  const who = cleanUsername(username);
  if (!(await canTouch(scope, who))) {
    return { ok: false, error: "Essa pessoa não é da tua família." };
  }

  const clean = cleanEmail(email);
  if (clean === "") return { ok: false, error: "Email inválido." };
  try {
    await getDb()
      .update(users)
      .set({ email: clean })
      .where(eq(users.username, who));
  } catch {
    return { ok: false, error: "Esse email já está noutra conta." };
  }
  revalidatePath("/admin/utilizadores");
  return { ok: true };
}

export async function setAccountRole(
  username: string,
  role: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const scope = await manageScope();
  const admin = { username: scope.username };
  const target = cleanUsername(username);
  if (!(await canTouch(scope, target))) {
    return { ok: false, error: "Essa pessoa não é da tua família." };
  }

  if (!ROLE_VALUES.includes(role as Role)) {
    return { ok: false, error: "Papel inválido." };
  }
  if (target === admin.username && role !== "admin") {
    return { ok: false, error: "Não podes retirar-te os teus próprios poderes." };
  }
  if (role !== "admin" && (await roleOf(target)) === "admin") {
    if ((await adminCount(target)) === 0) {
      return { ok: false, error: "Tem de ficar pelo menos um administrador." };
    }
  }
  await getDb()
    .update(users)
    .set({ role })
    .where(eq(users.username, target));
  revalidatePath("/admin/utilizadores");
  return { ok: true };
}

export async function setAccountMode(
  username: string,
  mode: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const scope = await manageScope();
  const who = cleanUsername(username);
  if (!(await canTouch(scope, who))) {
    return { ok: false, error: "Essa pessoa não é da tua família." };
  }

  if (!MODES.includes(mode)) return { ok: false, error: "Modo inválido." };
  await getDb()
    .update(users)
    .set({ mode })
    .where(eq(users.username, who));
  revalidatePath("/admin/utilizadores");
  return { ok: true };
}

/**
 * Remove an account WITHOUT destroying its history — the safe "remove user".
 * Deactivated people cannot sign in and stop appearing in pickers, but their
 * homework, cards and activity stay intact and reversible.
 */
export async function setAccountActive(
  username: string,
  active: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const scope = await manageScope();
  const admin = { username: scope.username };
  const target = cleanUsername(username);
  if (!(await canTouch(scope, target))) {
    return { ok: false, error: "Essa pessoa não é da tua família." };
  }

  if (target === admin.username && !active) {
    return { ok: false, error: "Não te podes desativar a ti próprio." };
  }
  if (!active && (await roleOf(target)) === "admin" && (await adminCount(target)) === 0) {
    return { ok: false, error: "Tem de ficar pelo menos um administrador ativo." };
  }
  await getDb()
    .update(users)
    .set({ active })
    .where(eq(users.username, target));
  revalidatePath("/admin/utilizadores");
  return { ok: true };
}

/** Every table that stores a username, and the column it stores it in. */
const USER_TABLES: { table: string; column: string }[] = [
  { table: "notes", column: "username" },
  { table: "homework", column: "username" },
  { table: "quizzes", column: "username" },
  { table: "ai_usage", column: "username" },
  { table: "cards", column: "username" },
  { table: "review_logs", column: "username" },
  { table: "unit_progress", column: "username" },
  { table: "mission_attempts", column: "username" },
  { table: "ls_sessions", column: "username" },
  { table: "activity", column: "username" },
  { table: "memberships", column: "username" },
  { table: "kudos", column: "from_user" },
  { table: "kudos", column: "to_user" },
];

/**
 * Rename an account, carrying every row it owns with it.
 *
 * username is a plain text column in a dozen tables with no foreign keys, so a
 * naive UPDATE on users alone would orphan all of that person's work. Neon's
 * HTTP driver has no interactive transactions, so this is ONE data-modifying
 * CTE: every table moves together or nothing does.
 */
export async function renameAccount(
  username: string,
  newUsername: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const scope = await manageScope();
  const admin = { username: scope.username };
  const from = cleanUsername(username);
  const to = cleanUsername(newUsername);
  if (!(await canTouch(scope, from))) {
    return { ok: false, error: "Essa pessoa não é da tua família." };
  }

  if (from === to) return { ok: true };

  const bad = usernameProblem(to);
  if (bad) return { ok: false, error: bad };
  if (!isSafeName(from) || !isSafeName(to)) {
    return { ok: false, error: "Nome de utilizador inválido." };
  }

  const db = getDb();
  const [clash] = await db
    .select({ username: users.username })
    .from(users)
    .where(eq(users.username, to))
    .limit(1);
  if (clash) return { ok: false, error: "Esse nome de utilizador já existe." };

  const [exists] = await db
    .select({ username: users.username })
    .from(users)
    .where(eq(users.username, from))
    .limit(1);
  if (!exists) return { ok: false, error: "Conta não encontrada." };

  const ctes = USER_TABLES.map(
    (t, i) =>
      `t${i} AS (UPDATE "${t.table}" SET "${t.column}" = $1 WHERE "${t.column}" = $2 RETURNING 1)`
  ).join(",\n     ");
  const statement =
    `WITH u AS (UPDATE "users" SET "username" = $1 WHERE "username" = $2 RETURNING 1),\n     ` +
    `${ctes}\nSELECT 1`;

  try {
    await db.execute(sql.raw(statement.replace(/\$1/g, `'${to}'`).replace(/\$2/g, `'${from}'`)));
  } catch {
    return { ok: false, error: "A mudança de nome falhou — nada foi alterado." };
  }

  await logActivity(
    admin.username,
    "admin",
    `Conta renomeada: ${from} → ${to}`,
    0
  ).catch(() => {});

  revalidatePath("/admin/utilizadores");
  return { ok: true };
}

/**
 * Permanently delete an account AND everything it owns. Irreversible — the UI
 * makes the admin type the username to reach it, and setAccountActive(false)
 * is the reversible option offered first.
 */
export async function deleteAccountForever(
  username: string,
  confirmation: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const scope = await manageScope();
  const admin = { username: scope.username };
  const target = cleanUsername(username);
  if (!(await canTouch(scope, target))) {
    return { ok: false, error: "Essa pessoa não é da tua família." };
  }

  if (target === admin.username) {
    return { ok: false, error: "Não te podes apagar a ti próprio." };
  }
  if (!isSafeName(target)) {
    return { ok: false, error: "Nome de utilizador inválido." };
  }
  if (cleanUsername(confirmation) !== target) {
    return { ok: false, error: "Escreve o nome de utilizador exatamente para confirmar." };
  }
  if ((await roleOf(target)) === "admin" && (await adminCount(target)) === 0) {
    return { ok: false, error: "Tem de ficar pelo menos um administrador." };
  }

  const db = getDb();
  const ctes = USER_TABLES.map(
    (t, i) => `d${i} AS (DELETE FROM "${t.table}" WHERE "${t.column}" = '${target}' RETURNING 1)`
  ).join(",\n     ");
  try {
    await db.execute(
      sql.raw(
        `WITH ${ctes},\n     du AS (DELETE FROM "users" WHERE "username" = '${target}' RETURNING 1)\nSELECT 1`
      )
    );
  } catch {
    return { ok: false, error: "Não foi possível apagar a conta." };
  }

  await logActivity(admin.username, "admin", `Conta apagada: ${target}`, 0).catch(
    () => {}
  );
  revalidatePath("/admin/utilizadores");
  return { ok: true };
}

/** Any signed-in person may switch their own guided/full preference. */
export async function setMyMode(mode: string): Promise<void> {
  const session = await requireSession();
  if (!MODES.includes(mode)) return;
  await getDb()
    .update(users)
    .set({ mode })
    .where(eq(users.username, session.username));
  revalidatePath("/", "layout");
}

/**
 * Adopt everyone with no household into the caller's own.
 *
 * Accounts created before enrolment existed have no membership row, which
 * makes them invisible on the family board and unassignable homework while
 * still being able to sign in — a confusing half-existence. This is the repair
 * button for that; new accounts are enrolled at creation.
 */
export async function adoptOrphans(): Promise<
  { ok: true; adopted: number } | { ok: false; error: string }
> {
  const scope = await manageScope();
  if (scope.accountId === null) {
    return { ok: false, error: "A tua conta não pertence a uma família." };
  }
  const orphans = await orphanUsernames();
  if (orphans.length === 0) return { ok: true, adopted: 0 };

  let adopted = 0;
  for (const username of orphans) {
    if (await adoptIntoHousehold(username, scope.accountId)) adopted++;
  }
  revalidatePath("/", "layout");
  return { ok: true, adopted };
}
