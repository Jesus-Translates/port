import Link from "next/link";
import { notFound } from "next/navigation";
import { AudioButton } from "@/components/audio-button";
import { CategoryView } from "@/components/category-view";
import { UnitContinue, UnitReturn } from "@/components/unit-return";
import { requireSession } from "@/lib/auth";
import { getCategoryBySlug } from "@/lib/data";
import { unitContextFrom } from "@/lib/unit-context";

export default async function CategoryPage(
  props: PageProps<"/reference/[slug]">
) {
  await requireSession();
  const { slug } = await props.params;
  const data = await getCategoryBySlug(slug);
  if (!data) notFound();
  /*
   * A phrasebook category is usually step ONE of unit one, and this page had
   * no idea it could be a course step: no way back to the unit, and no way to
   * tick the step off. The course could not be started from the card that
   * offers to start it.
   */
  const unit = await unitContextFrom(await props.searchParams);

  const { category, entries } = data;

  return (
    <div className="space-y-5">
      <header>
        {unit ? (
          <UnitReturn unit={unit} />
        ) : (
          <Link
            href="/reference"
            className="text-xs text-ink-faint hover:text-olive"
          >
            ← O Livro
          </Link>
        )}
        <div className="mt-1 flex items-center gap-3">
          <span className="text-4xl" aria-hidden>
            {category.emoji}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl leading-tight font-semibold tracking-tight">
                {category.namePt}
              </h1>
              <AudioButton text={category.namePt} className="shrink-0" />
            </div>
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

      {/* Reading a phrasebook has no natural end, so when it IS a course step
          it needs one — otherwise the step can never be finished. Renders
          nothing when the page was opened on its own. */}
      <UnitContinue unit={unit} />
    </div>
  );
}
