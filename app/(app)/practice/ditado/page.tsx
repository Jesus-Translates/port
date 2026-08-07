import Link from "next/link";
import { sql } from "drizzle-orm";
import { DitadoPlayer } from "@/components/ditado-player";
import { requireSession } from "@/lib/auth";
import { getDb, refEntries } from "@/lib/db";

export const metadata = { title: "Ditado" };

export default async function DitadoPage() {
  await requireSession();
  // Five random spoken-size phrases; ONLY ids and glosses go to the client —
  // the Portuguese text stays server-side until each sentence is graded.
  const picks = await getDb()
    .select({ id: refEntries.id, en: refEntries.en })
    .from(refEntries)
    .where(sql`${refEntries.kind} = 'phrase' and length(${refEntries.pt}) between 15 and 90`)
    .orderBy(sql`random()`)
    .limit(5);

  return (
    <div className="space-y-6">
      <header>
        <Link href="/practice" className="text-xs text-ink-faint hover:text-olive">
          ← Praticar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">✏️ Ditado</h1>
        <p className="mt-1 text-sm text-ink-soft">
          The classic Portuguese school exercise: listen, write what you hear.
          Trains the ear for real pt-PT — swallowed vowels and all. Accents are
          forgiven.
        </p>
      </header>

      {picks.length === 0 ? (
        <p className="card p-6 text-center text-sm text-ink-soft">
          O livro ainda não tem frases suficientes.
        </p>
      ) : (
        <DitadoPlayer sentences={picks} />
      )}
    </div>
  );
}
