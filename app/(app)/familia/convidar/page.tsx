import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth";
import { accounts, getDb, memberships } from "@/lib/db";
import { currentAccountId } from "@/lib/tenant";
import { InviteForm } from "@/components/invite-form";

export const metadata = { title: "Convidar" };

/**
 * Invite someone to the household by email. Owner/parent only — everyone
 * else is sent back to /familia. The server action re-checks everything;
 * this gate just keeps the page honest about who it is for.
 */
export default async function ConvidarPage() {
  const session = await requireSession();
  const accountId = await currentAccountId();
  if (accountId === null) redirect("/familia");

  const db = getDb();
  const [me] = await db
    .select({ role: memberships.role })
    .from(memberships)
    .where(eq(memberships.username, session.username))
    .limit(1);
  if (me?.role !== "owner" && me?.role !== "parent") redirect("/familia");

  const [[account], members] = await Promise.all([
    db
      .select({ name: accounts.name, seatLimit: accounts.seatLimit })
      .from(accounts)
      .where(eq(accounts.id, accountId))
      .limit(1),
    db
      .select({ username: memberships.username })
      .from(memberships)
      .where(eq(memberships.accountId, accountId)),
  ]);
  const seatsFree = Math.max(0, (account?.seatLimit ?? 0) - members.length);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Convidar para a família
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Enviamos um link por email — quem o recebe escolhe o próprio nome e a
          própria palavra-passe.
        </p>
        <p className="mt-1 text-xs text-ink-faint">
          {seatsFree === 1
            ? "Resta 1 lugar livre."
            : `Restam ${seatsFree} lugares livres.`}
        </p>
      </div>

      <InviteForm />

      <p className="text-center text-xs text-ink-faint">
        <Link href="/familia" className="hover:text-olive">
          ← voltar à família
        </Link>
      </p>
    </div>
  );
}
