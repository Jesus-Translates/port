import Link from "next/link";
import { HouseholdsAdmin } from "@/components/households-admin";
import { listHouseholds } from "@/lib/actions/households";

export const metadata = { title: "Famílias" };

export default async function HouseholdsPage() {
  // listHouseholds gates on ADMIN_USERS and redirects anyone else, so a
  // family's own admin cannot reach this by guessing the URL.
  const households = await listHouseholds();

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin" className="text-xs text-ink-soft hover:text-olive">
          ← voltar ao painel
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          🏠 Famílias · Households
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Create a family, change its plan and seats, move someone between
          families, or retire one. People WITHIN a family are managed in{" "}
          <Link href="/admin/utilizadores" className="underline underline-offset-2 hover:text-olive">
            Contas
          </Link>
          .
        </p>
      </header>

      <HouseholdsAdmin households={households} />

      <p className="text-xs text-ink-faint">
        {households.length}{" "}
        {households.length === 1 ? "família" : "famílias"} ·{" "}
        {households.reduce((n, h) => n + h.members.length, 0)} pessoas no total.
        Novas famílias também se registam sozinhas em{" "}
        <code>/registar</code>.
      </p>
    </div>
  );
}
