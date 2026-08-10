"use server";

import { revalidatePath } from "next/cache";
import { asc, count, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { isOperator, requireSession } from "@/lib/auth";
import { accounts, getDb, memberships, people, users } from "@/lib/db";

/**
 * Managing FAMILIES, as opposed to managing the people inside one.
 *
 * A naming trap worth stating plainly: lib/actions/users.ts has
 * createAccount(), and it creates a USER. The `accounts` TABLE is a household.
 * Everything in this file operates on households, and says so.
 *
 * This is instance-operator work — creating a family, changing its plan,
 * moving somebody between families — so it is gated on ADMIN_USERS rather than
 * on the household-admin role. A family's own owner must never be able to see
 * or touch another family; that boundary is the whole point of the tenancy
 * work and this file must not become the hole in it.
 */

export type Household = {
  id: number;
  slug: string;
  name: string;
  plan: string;
  seatLimit: number;
  createdAt: string;
  members: { username: string; displayName: string; role: string; active: boolean }[];
};

export type Result = { ok: true } | { ok: false; error: string };

/** Instance operator only — not a household admin. */
async function requireOperator(): Promise<string> {
  const session = await requireSession();
  if (!(await isOperator(session.username))) redirect("/");
  return session.username;
}

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

const PLANS = ["free", "individual", "family"];

export async function listHouseholds(): Promise<Household[]> {
  await requireOperator();
  const db = getDb();

  // Grouped queries and a Map, never a correlated sub-select — that pattern
  // renders the outer column unqualified here and silently returns zeros.
  const [rows, memberRows, userRows] = await Promise.all([
    db.select().from(accounts).orderBy(asc(accounts.id)),
    db.select().from(memberships),
    db
      .select({
        username: users.username,
        displayName: users.displayName,
        active: users.active,
      })
      .from(users),
  ]);

  const nameBy = new Map(userRows.map((u) => [u.username, u]));
  const byAccount = new Map<number, Household["members"]>();
  for (const m of memberRows) {
    const u = nameBy.get(m.username);
    const list = byAccount.get(m.accountId) ?? [];
    list.push({
      username: m.username,
      displayName: u?.displayName ?? m.username,
      role: m.role,
      active: u?.active ?? true,
    });
    byAccount.set(m.accountId, list);
  }

  return rows.map((a) => ({
    id: a.id,
    slug: a.slug,
    name: a.name,
    plan: a.plan,
    seatLimit: a.seatLimit,
    createdAt: new Date(a.createdAt).toISOString().slice(0, 10),
    members: (byAccount.get(a.id) ?? []).sort((x, y) =>
      x.role === "owner" ? -1 : y.role === "owner" ? 1 : 0
    ),
  }));
}

export async function createHousehold(input: {
  name: string;
  plan?: string;
  seatLimit?: number;
}): Promise<Result & { id?: number }> {
  await requireOperator();
  const name = String(input.name ?? "").trim().slice(0, 60);
  if (!name) return { ok: false, error: "Falta o nome da família." };

  const plan = PLANS.includes(String(input.plan)) ? String(input.plan) : "family";
  const seatLimit = Math.min(
    50,
    Math.max(1, Math.round(Number(input.seatLimit) || (plan === "individual" ? 1 : 6)))
  );

  const db = getDb();
  let slug = slugify(name);
  for (let i = 2; i < 50; i++) {
    const [taken] = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.slug, slug))
      .limit(1);
    if (!taken) break;
    slug = `${slugify(name)}-${i}`;
  }

  try {
    const [row] = await db
      .insert(accounts)
      .values({ slug, name, plan, seatLimit })
      .returning({ id: accounts.id });
    revalidatePath("/admin/familias");
    return { ok: true, id: row.id };
  } catch {
    return { ok: false, error: "Não foi possível criar a família." };
  }
}

export async function renameHousehold(id: number, name: string): Promise<Result> {
  await requireOperator();
  const clean = String(name ?? "").trim().slice(0, 60);
  if (!clean) return { ok: false, error: "Falta o nome." };
  // The slug is left alone on purpose: it may already be in URLs and logs, and
  // a display name is not an identifier.
  await getDb().update(accounts).set({ name: clean }).where(eq(accounts.id, id));
  revalidatePath("/admin/familias");
  return { ok: true };
}

export async function setHouseholdPlan(
  id: number,
  plan: string,
  seatLimit: number
): Promise<Result> {
  await requireOperator();
  if (!PLANS.includes(plan)) return { ok: false, error: "Plano inválido." };
  const seats = Math.min(50, Math.max(1, Math.round(Number(seatLimit) || 1)));

  const db = getDb();
  const [used] = await db
    .select({ n: count() })
    .from(memberships)
    .where(eq(memberships.accountId, id));
  // Never let a seat limit silently cut below the people already inside — the
  // members do not disappear, so the number would just be a lie.
  if (Number(used?.n ?? 0) > seats) {
    return {
      ok: false,
      error: `Esta família já tem ${used?.n} membros — o limite não pode ser ${seats}.`,
    };
  }

  await db.update(accounts).set({ plan, seatLimit: seats }).where(eq(accounts.id, id));
  revalidatePath("/admin/familias");
  revalidatePath("/admin/relatorios");
  return { ok: true };
}

/**
 * Move somebody from one family to another.
 *
 * Their learning history follows automatically: cards, progress, homework and
 * spend are all keyed by username, and a household is just a set of usernames.
 * What changes is who can see them.
 */
export async function moveMember(
  username: string,
  toAccountId: number,
  role: "owner" | "parent" | "child" = "child"
): Promise<Result> {
  await requireOperator();
  const who = String(username ?? "").trim().toLowerCase();
  const db = getDb();

  const [target] = await db
    .select({ id: accounts.id, name: accounts.name, seatLimit: accounts.seatLimit })
    .from(accounts)
    .where(eq(accounts.id, toAccountId))
    .limit(1);
  if (!target) return { ok: false, error: "Família não encontrada." };

  const [used] = await db
    .select({ n: count() })
    .from(memberships)
    .where(eq(memberships.accountId, toAccountId));
  if (Number(used?.n ?? 0) >= target.seatLimit) {
    return { ok: false, error: `${target.name} já tem todos os lugares ocupados.` };
  }

  const [u] = await db
    .select({ displayName: users.displayName, email: users.email })
    .from(users)
    .where(eq(users.username, who))
    .limit(1);
  if (!u) return { ok: false, error: "Essa pessoa não existe." };

  try {
    await db.delete(memberships).where(eq(memberships.username, who));
    const [person] = await db
      .insert(people)
      .values({ displayName: u.displayName, email: u.email })
      .returning({ id: people.id });
    await db.insert(memberships).values({
      accountId: toAccountId,
      personId: person.id,
      username: who,
      role,
    });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return { ok: false, error: "Não foi possível mover esta pessoa." };
  }
}

export async function setMemberRole(
  username: string,
  role: "owner" | "parent" | "child"
): Promise<Result> {
  await requireOperator();
  await getDb()
    .update(memberships)
    .set({ role })
    .where(eq(memberships.username, String(username).trim().toLowerCase()));
  revalidatePath("/admin/familias");
  return { ok: true };
}

/**
 * Delete a family. Refuses while anyone is still in it.
 *
 * Deleting the household would cascade its memberships and leave every member
 * an orphan — able to sign in, invisible everywhere. Emptying it first is a
 * deliberate decision about real people, not a checkbox.
 */
export async function deleteHousehold(id: number): Promise<Result> {
  await requireOperator();
  const db = getDb();

  const [used] = await db
    .select({ n: count() })
    .from(memberships)
    .where(eq(memberships.accountId, id));
  if (Number(used?.n ?? 0) > 0) {
    return {
      ok: false,
      error: `Ainda tem ${used?.n} membro(s). Move-os primeiro para outra família.`,
    };
  }

  const [remaining] = await db.select({ n: count() }).from(accounts);
  if (Number(remaining?.n ?? 0) <= 1) {
    return { ok: false, error: "Não podes apagar a última família." };
  }

  await db.execute(sql`delete from ${accounts} where ${accounts.id} = ${id}`);
  revalidatePath("/admin/familias");
  return { ok: true };
}
