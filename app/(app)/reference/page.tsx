import Link from "next/link";
import { CategoryForm } from "@/components/category-form";
import { IngestPanel } from "@/components/ingest-panel";
import { requireSession } from "@/lib/auth";
import { getCategoriesWithCounts } from "@/lib/data";

export const metadata = { title: "O Livro" };

export default async function ReferencePage() {
  await requireSession();
  const cats = await getCategoriesWithCounts();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">📖 O Livro</h1>
          <p className="mt-1 text-sm text-ink-soft">
            The family phrasebook — quick reference for real life in Portugal.
            Everyone can add to it.
          </p>
        </div>
        <CategoryForm />
      </header>

      <IngestPanel />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cats.map((c) => (
          <Link
            key={c.id}
            href={`/reference/${c.slug}`}
            className="card group p-4 transition-all hover:border-sage hover:shadow-md"
          >
            <div className="text-3xl" aria-hidden>
              {c.emoji}
            </div>
            <div className="mt-2 leading-tight font-semibold group-hover:text-olive">
              {c.namePt}
            </div>
            <div className="text-xs text-ink-soft">{c.nameEn}</div>
            <div className="mt-2 text-2xs text-ink-faint">
              {c.entryCount} {c.entryCount === 1 ? "entry" : "entries"}
            </div>
          </Link>
        ))}
      </div>

      {cats.length === 0 ? (
        <p className="card p-6 text-center text-sm text-ink-soft">
          The book is empty — run the seed script or add a category to start.
        </p>
      ) : null}
    </div>
  );
}
