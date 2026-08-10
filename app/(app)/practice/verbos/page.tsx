import { redirect } from "next/navigation";

/**
 * Retired: the app carried two verb trainers over the same lib/verbs data.
 *
 * This one was write-only; /verbos offers the same rounds plus choose and
 * speak modes and the class/regularity/tense filters, and is now unit-aware
 * too — which was the only thing this page did that it could not. Kept as a
 * redirect so unit paths, bookmarks and in-flight links still land somewhere
 * sensible instead of 404ing.
 */
export default async function RetiredVerbDrill(
  props: PageProps<"/practice/verbos">
) {
  const sp = await props.searchParams;
  const qs = new URLSearchParams({ tab: "treinar" });
  for (const key of ["tema", "unidade", "item", "tempo"]) {
    const v = sp[key];
    const one = Array.isArray(v) ? v[0] : v;
    if (one) qs.set(key, one);
  }
  redirect(`/verbos?${qs.toString()}`);
}
