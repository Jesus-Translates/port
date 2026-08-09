import { isItemKind, KIND_META, type ItemKind } from "@/lib/course";

/**
 * Turning one unit path item into the screen that runs it.
 *
 * This lived inside the unit page, which meant the dashboard could only ever
 * link to the unit itself and make the learner pick a step. Sharing it lets
 * "what do I do now?" resolve all the way to the actual activity.
 */

type ItemConfig = { topic?: string; level?: string };

export type ItemRow = {
  id: number;
  kind: string;
  titlePt: string;
  config: unknown;
  catSlug: string | null;
  catName: string | null;
};

/** Rows written before the path generator used lib/course's vocabulary. */
function normalizeKind(raw: string): ItemKind | null {
  const k = raw.trim().toLowerCase();
  if (isItemKind(k)) return k;
  if (k === "category" || k === "reference") return "vocab";
  if (k === "listening") return "escutar";
  return null;
}

/**
 * Every item resolves to a screen that ALREADY EXISTS, and carries its topic
 * with it — the learner lands on something ready to run, never on an empty
 * form they have to fill in themselves.
 */
export function resolve(
  item: ItemRow,
  unitSlug: string
): { kind: ItemKind; href: string; hint: string } | null {
  const kind = normalizeKind(item.kind);
  if (!kind) return null;

  const config = (item.config ?? {}) as ItemConfig;
  const topic = (config.topic ?? "").trim();
  const q = encodeURIComponent(topic);
  const about = topic ? topic : KIND_META[kind].trains;

  switch (kind) {
    // Every destination gets the topic AND the unit it came from, so nothing
    // lands on an empty form and everything knows the way back.
    case "vocab":
      if (!item.catSlug) return null; // a phrasebook link with no category is a dead end
      return {
        kind,
        href: `/reference/${item.catSlug}`,
        hint: item.catName ?? "livro de referência",
      };
    case "quiz":
      return {
        kind,
        href: `/practice?${topic ? `topic=${q}&` : ""}unidade=${encodeURIComponent(unitSlug)}&item=${item.id}`,
        hint: about,
      };
    case "jogo-pares":
      return {
        kind,
        href: `/jogos/pares?${topic ? `topic=${q}&` : ""}unidade=${encodeURIComponent(unitSlug)}&item=${item.id}`,
        hint: about,
      };
    case "jogo-frase":
      return {
        kind,
        href: `/jogos/frase?${topic ? `topic=${q}&` : ""}unidade=${encodeURIComponent(unitSlug)}&item=${item.id}`,
        hint: about,
      };
    // The no-AI games do not take a topic — they deal from the phrasebook and
    // the verb tables, so all they need is the way back to the unit.
    case "jogo-genero":
    case "jogo-verbo":
    case "jogo-intruso":
    case "jogo-responde": {
      const slug = kind.replace("jogo-", "");
      return {
        kind,
        href: `/jogos/${slug}?unidade=${encodeURIComponent(unitSlug)}&item=${item.id}`,
        hint: about,
      };
    }
    case "ditado":
      return {
        kind,
        href: `/practice/ditado?${topic ? `tema=${q}&` : ""}unidade=${encodeURIComponent(unitSlug)}&item=${item.id}`,
        hint: about,
      };
    case "cloze":
      return {
        kind,
        href: `/practice/ditado?modo=cloze&${topic ? `tema=${q}&` : ""}unidade=${encodeURIComponent(unitSlug)}&item=${item.id}`,
        hint: about,
      };
    case "verbos":
      return {
        kind,
        href: `/practice/verbos?${topic ? `tema=${q}&` : ""}unidade=${encodeURIComponent(unitSlug)}&item=${item.id}`,
        hint: about,
      };
    case "escutar":
      return {
        kind,
        href: `/escutar?${topic ? `tema=${q}&` : ""}unidade=${encodeURIComponent(unitSlug)}&item=${item.id}`,
        hint: about,
      };
    case "story":
      return {
        kind,
        href: `/stories?${topic ? `tema=${q}&` : ""}unidade=${encodeURIComponent(unitSlug)}&item=${item.id}`,
        hint: about,
      };
    case "falar":
      return {
        kind,
        href: `/practice/falar?${topic ? `tema=${q}&` : ""}unidade=${encodeURIComponent(unitSlug)}&item=${item.id}`,
        hint: about,
      };
    case "conversa":
      return {
        kind,
        href: `/practice/conversa?${topic ? `tema=${q}&` : ""}unidade=${encodeURIComponent(unitSlug)}&item=${item.id}`,
        hint: about,
      };
    case "homework":
      return {
        kind,
        href: `/homework?${topic ? `topic=${q}&` : ""}unidade=${encodeURIComponent(unitSlug)}&item=${item.id}`,
        hint: about,
      };
  }
}
