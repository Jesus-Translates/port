import Link from "next/link";
import { AccountsAdmin } from "@/components/accounts-admin";
import { requireAdmin } from "@/lib/auth";
import { listAccounts } from "@/lib/actions/users";
import { ChangeMyPassword } from "@/components/change-my-password";

export const metadata = { title: "Contas" };

export default async function AccountsPage() {
  const session = await requireAdmin();
  const accounts = await listAccounts();

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin" className="text-xs text-ink-soft hover:text-accent">
          ← voltar ao painel
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          👥 Contas · People
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Add and remove people, set passwords, change usernames and emails, and
          choose who sees the guided app versus every feature.
        </p>
      </header>

      <ChangeMyPassword />

      <AccountsAdmin accounts={accounts} me={session.username} />
    </div>
  );
}
