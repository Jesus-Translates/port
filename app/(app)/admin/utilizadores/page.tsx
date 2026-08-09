import Link from "next/link";
import { AccountsAdmin } from "@/components/accounts-admin";
import { requireSession } from "@/lib/auth";
import { listAccounts } from "@/lib/actions/users";
import { ChangeMyPassword } from "@/components/change-my-password";

export const metadata = { title: "Contas" };

export default async function AccountsPage() {
  // listAccounts() does the real gating and scoping — a family admin lands
  // here for their own household, an instance admin for every household.
  const session = await requireSession();
  const accounts = await listAccounts();

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin" className="text-xs text-ink-soft hover:text-olive">
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
