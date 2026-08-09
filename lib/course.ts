/**
 * The course contract.
 *
 * A unit is: a Learning Note, then an ordered path of activities, then one
 * capstone that makes the learner PRODUCE the language out loud. Every kind
 * below must resolve to a screen that already exists — a path item that dead
 * -ends into a generic form is worse than no item at all.
 *
 * Shared by the path generator, the unit page and the games, so all three
 * agree on what an item is.
 */

export type ItemKind =
  | "vocab" // read the phrasebook category first
  | "quiz" // AI test on this unit's point
  | "jogo-pares" // game: match PT ↔ EN against the clock
  | "jogo-frase" // game: rebuild the sentence from word tiles
  | "jogo-genero" // game: o or a — grammatical gender against the clock
  | "jogo-verbo" // game: is this conjugation right or wrong?
  | "jogo-intruso" // game: which word does not belong
  | "jogo-responde" // game: pick the reply a real person would give
  | "ditado" // dictation — hear it, write it
  | "cloze" // hear it, fill the one missing word
  | "verbos" // conjugation sprint
  | "escutar" // listen to a dialogue with a synced transcript
  | "story" // read a graded story
  | "falar" // read aloud, get a pronunciation score
  | "conversa" // talk with Sandra about this unit's topic
  | "homework"; // write it, Sandra marks every answer

export const ITEM_KINDS: ItemKind[] = [
  "vocab",
  "quiz",
  "jogo-pares",
  "jogo-frase",
  "jogo-genero",
  "jogo-verbo",
  "jogo-intruso",
  "jogo-responde",
  "ditado",
  "cloze",
  "verbos",
  "escutar",
  "story",
  "falar",
  "conversa",
  "homework",
];

export const KIND_META: Record<
  ItemKind,
  { emoji: string; label: string; trains: string }
> = {
  vocab: { emoji: "📖", label: "Ler o livro", trains: "recognition" },
  quiz: { emoji: "🎯", label: "Teste", trains: "recall" },
  "jogo-pares": { emoji: "🃏", label: "Jogo dos pares", trains: "recognition" },
  "jogo-frase": { emoji: "🧱", label: "Constrói a frase", trains: "word order" },
  "jogo-genero": { emoji: "⚖️", label: "O ou A?", trains: "noun gender" },
  "jogo-verbo": { emoji: "🎯", label: "Certo ou Errado?", trains: "verb agreement" },
  "jogo-intruso": { emoji: "🕵️", label: "O Intruso", trains: "word families" },
  "jogo-responde": { emoji: "🗨️", label: "Responde!", trains: "what to say back" },
  ditado: { emoji: "✏️", label: "Ditado", trains: "listening" },
  cloze: { emoji: "🔍", label: "Palavra escondida", trains: "listening" },
  verbos: { emoji: "⚡", label: "Verbos", trains: "conjugation" },
  escutar: { emoji: "👂", label: "Escutar", trains: "listening" },
  story: { emoji: "📕", label: "História", trains: "reading" },
  falar: { emoji: "🎙️", label: "Ler em voz alta", trains: "pronunciation" },
  conversa: { emoji: "💬", label: "Conversa", trains: "speaking" },
  homework: { emoji: "✍️", label: "TPC", trains: "writing" },
};

/** Kinds that make the learner SPEAK. Every unit path must end on one. */
export const SPEAKING_KINDS: ItemKind[] = ["falar", "conversa"];

/** Kinds that are games — a unit path should carry at least one most of the time. */
export const GAME_KINDS: ItemKind[] = [
  "jogo-pares",
  "jogo-frase",
  "jogo-genero",
  "jogo-verbo",
  "jogo-intruso",
  "jogo-responde",
];

export function isItemKind(v: string): v is ItemKind {
  return (ITEM_KINDS as string[]).includes(v);
}

/**
 * The shape of a unit's path, as a rule rather than a fixed list:
 * 1. meet the words (vocab / escutar / story)
 * 2. two or three drills, at least one of them a GAME
 * 3. produce it in writing (quiz / homework)
 * 4. produce it OUT LOUD (falar / conversa) — always last, always present
 * 5–7 items total. Never two of the same kind.
 */
export const PATH_RULE = `Build the unit's path as 5-7 items, in this shape:
1. FIRST, meet the language: "vocab" (if a phrasebook category fits), otherwise "escutar" or "story".
2. THEN 2-3 drills. At least one MUST be a game ("jogo-pares" or "jogo-frase") unless the unit is pure grammar,
   in which case "verbos" may take its place. Pick drills that suit the point: "ditado"/"cloze" for listening and
   spelling, "jogo-frase" for word order, "verbos" for conjugation.
3. THEN production in writing: "quiz" or "homework".
4. LAST, ALWAYS, production out loud: "conversa" for situational units, "falar" for units about pronunciation
   or fixed phrases. The unit is not finished until the learner has said it.
Never repeat a kind within a unit. Order matters — easiest recognition first, hardest production last.

Each item's "topic" is BOTH the instruction we generate from AND the label the learner reads on the activity.
Keep it under 70 characters and write it as a title, not a brief: "Nomes de parentes em português europeu",
not "Relacionar os nomes de parentes em português europeu — cunhado, sogra, sobrinho, primo, madrinha…".
Put the detail in the item's own titlePt if it is needed at all.`;
