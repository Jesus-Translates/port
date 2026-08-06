import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryView } from "@/components/category-view";
import { requireSession } from "@/lib/auth";
import { getCategoryBySlug } from "@/lib/data";

export default async function CategoryPage(
  props: PageProps<"/reference/[slug]">
) {
  await requireSession();
  const { slug } = await props.params;
  const data = await getCategoryBySlug(slug);
  if (!data) notFound();

  const { category, entries } = data;

  return (
    <div className="space-y-5">
      <header>
        <Link
          href="/reference"
          className="text-xs text-ink-faint hover:text-olive"
        >
          ← O Livro
        </Link>
        <div className="mt-1 flex items-center gap-3">
          <span className="text-4xl" aria-hidden>
            {category.emoji}
          </span>
          <div>
            <h1 className="text-2xl leading-tight font-semibold tracking-tight">
              {category.namePt}
            </h1>
            <p className="text-sm text-ink-soft">
              {category.nameEn}
              {category.blurbEn ? ` — ${category.blurbEn}` : ""}
            </p>
          </div>
        </div>
      </header>

      <CategoryView
        category={{
          id: category.id,
          slug: category.slug,
          namePt: category.namePt,
          nameEn: category.nameEn,
        }}
        entries={entries.map((e) => ({
          id: e.id,
          kind: e.kind,
          section: e.section,
          pt: e.pt,
          en: e.en,
          replyPt: e.replyPt,
          replyEn: e.replyEn,
          note: e.note,
          addedBy: e.addedBy,
        }))}
      />
    </div>
  );
}
