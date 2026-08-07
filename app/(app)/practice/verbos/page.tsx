import Link from "next/link";
import { VerbDrill } from "@/components/verb-drill";
import { requireSession } from "@/lib/auth";

export const metadata = { title: "Verbos" };

export default async function VerbosPage() {
  await requireSession();
  return (
    <div className="space-y-6">
      <header>
        <Link href="/practice" className="text-xs text-ink-faint hover:text-olive">
          ← Praticar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          ⚡ Verbos
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Conjugation sprints over the 30 verbs that carry everyday pt-PT.
          Note: European Portuguese says <em>falámos</em> (with the accent) in
          the pretérito perfeito.
        </p>
      </header>
      <VerbDrill />
    </div>
  );
}
