import type { PlacementItem } from "@/lib/placement-types";

/**
 * The placement questions themselves.
 *
 * Its own file because it is content, not logic: it gets rewritten wholesale
 * when the test is revised, and the marking rules in lib/placement.ts should
 * never move just because a question did. Written by Fable to a fixed brief —
 * European Portuguese only, seven items per level, and every level carrying at
 * least one dictation, one free-write and one sentence-build so no level can be
 * cleared on recognition alone.
 *
 * Where it is natural, one distractor is the BRAZILIAN form. That is not
 * trivia: telling "autocarro" from "ônibus", or "estamos a almoçar" from
 * "estamos almoçando", is the single most useful thing to know about a
 * learner who says they already speak some Portuguese.
 *
 * Dictation ids are deliberately opaque (a1-dict-1, not a1-dict-cozinha). The
 * id travels to the browser in the audio URL — /api/tts?placement=ID — so a
 * descriptive slug would hand over a word of the very sentence the learner is
 * being asked to transcribe. Every other kind can keep a readable id, because
 * nothing about them is secret.
 */
export const BANK: PlacementItem[] = [
  // ── A1 ──
  {
    id: "a1-choice-bomdia",
    level: "A1",
    kind: "choice",
    promptEn: "Which greeting do you use in the morning?",
    options: ["Bom dia", "Boa tarde", "Boa noite", "Até logo"],
    answer: "Bom dia",
  },
  {
    id: "a1-choice-pequeno-almoco",
    level: "A1",
    kind: "choice",
    promptEn: "In Portugal, what do you call the morning meal?",
    options: ["o pequeno-almoço", "o café da manhã", "o almoço", "o lanche"],
    answer: "o pequeno-almoço",
  },
  {
    id: "a1-gap-ser-sou",
    level: "A1",
    kind: "gap",
    promptEn: "Complete with the right form of 'ser'.",
    promptPt: "Eu ___ a Ana.",
    options: ["sou", "és", "é", "estou"],
    answer: "sou",
  },
  {
    id: "a1-gap-artigo-a",
    level: "A1",
    kind: "gap",
    promptEn: "Choose the missing article.",
    promptPt: "___ casa é grande.",
    options: ["A", "O", "Um", "Os"],
    answer: "A",
  },
  {
    id: "a1-dict-1",
    level: "A1",
    kind: "dictation",
    promptEn: "Listen and type exactly what you hear.",
    say: "A minha mãe está na cozinha",
  },
  {
    id: "a1-write-falamos",
    level: "A1",
    kind: "write",
    promptEn: "Translate: We speak Portuguese at home.",
    answer: "Falamos português em casa",
    alsoOk: [
      "Nós falamos português em casa",
      "Em casa falamos português",
      "A gente fala português em casa",
    ],
  },
  {
    id: "a1-wb-sou-de-portugal",
    level: "A1",
    kind: "wordbank",
    promptEn: "Build the sentence: I am from Portugal.",
    answer: "Eu sou de Portugal",
    extras: ["estou", "em", "do"],
  },

  // ── A2 ──
  {
    id: "a2-choice-autocarro",
    level: "A2",
    kind: "choice",
    promptEn: "In Portugal, which word means 'bus'?",
    options: ["autocarro", "ônibus", "comboio", "carrinha"],
    answer: "autocarro",
  },
  {
    id: "a2-choice-comprei",
    level: "A2",
    kind: "choice",
    promptEn: "Pick the correct way to say 'Yesterday I bought bread'.",
    options: [
      "Ontem comprei pão.",
      "Ontem comprava pão.",
      "Ontem compro pão.",
      "Ontem comprarei pão.",
    ],
    answer: "Ontem comprei pão.",
  },
  {
    id: "a2-gap-fomos",
    level: "A2",
    kind: "gap",
    promptEn: "Complete with the correct past form of 'ir'.",
    promptPt: "No sábado passado nós ___ à praia.",
    options: ["fomos", "vamos", "íamos", "fui"],
    answer: "fomos",
  },
  {
    id: "a2-gap-ao-mercado",
    level: "A2",
    kind: "gap",
    promptEn: "Choose the missing word.",
    promptPt: "Vou ___ mercado comprar fruta.",
    options: ["ao", "no", "do", "à"],
    answer: "ao",
  },
  {
    id: "a2-dict-1",
    level: "A2",
    kind: "dictation",
    promptEn: "Listen and type exactly what you hear.",
    say: "Ontem fui ao mercado com a minha mãe",
  },
  {
    id: "a2-write-comboio",
    level: "A2",
    kind: "write",
    promptEn: "Translate: I'm going to take the train tomorrow.",
    answer: "Vou apanhar o comboio amanhã",
    alsoOk: [
      "Amanhã vou apanhar o comboio",
      "Eu vou apanhar o comboio amanhã",
      "Vou de comboio amanhã",
    ],
  },
  {
    id: "a2-wb-almocar",
    level: "A2",
    kind: "wordbank",
    promptEn: "Build the sentence: We are having lunch at the café.",
    answer: "Estamos a almoçar no café",
    extras: ["almoçando", "estão", "em"],
  },

  // ── B1 ──
  {
    id: "b1-choice-imperfeito",
    level: "B1",
    kind: "choice",
    promptEn: "Pick the correct sentence for 'When I was little, I lived near the sea'.",
    options: [
      "Quando era pequeno, morava perto do mar.",
      "Quando fui pequeno, morei perto do mar.",
      "Quando era pequeno, morei perto do mar.",
      "Quando sou pequeno, moro perto do mar.",
    ],
    answer: "Quando era pequeno, morava perto do mar.",
  },
  {
    id: "b1-choice-chamo-me",
    level: "B1",
    kind: "choice",
    promptEn: "A neighbour asks your name. Which reply is correct?",
    options: ["Chamo-me Rita.", "Me chamo Rita.", "Chamo-te Rita.", "Eu chamo Rita."],
    answer: "Chamo-me Rita.",
  },
  {
    id: "b1-gap-possas",
    level: "B1",
    kind: "gap",
    promptEn: "Complete with the correct form of 'poder'.",
    promptPt: "Espero que tu ___ vir ao jantar.",
    options: ["possas", "podes", "poderás", "podias"],
    answer: "possas",
  },
  {
    id: "b1-gap-clitic-te",
    level: "B1",
    kind: "gap",
    promptEn: "Where does the pronoun go? Complete the sentence.",
    promptPt: "Não ___ esqueças de trazer o telemóvel.",
    options: ["te", "-te", "tu", "ti"],
    answer: "te",
  },
  {
    id: "b1-dict-1",
    level: "B1",
    kind: "dictation",
    promptEn: "Listen and type exactly what you hear.",
    say: "Antigamente íamos todos os domingos ao café",
  },
  {
    id: "b1-write-dame",
    level: "B1",
    kind: "write",
    promptEn: "Translate: Give me the keys, please.",
    answer: "Dá-me as chaves, por favor",
    alsoOk: [
      "Dá-me as chaves por favor",
      "Dá-me as chaves, se faz favor",
      "Dás-me as chaves, por favor?",
    ],
  },
  {
    id: "b1-wb-ja-fiz",
    level: "B1",
    kind: "wordbank",
    promptEn: "Build the sentence: I have already done the shopping.",
    answer: "Já fiz as compras",
    extras: ["fazia", "os", "tenho"],
  },

  // ── B2 ──
  {
    id: "b2-choice-chegares",
    level: "B2",
    kind: "choice",
    promptEn: "Choose the correct version of 'When you arrive, call me'.",
    options: [
      "Quando chegares, liga-me.",
      "Quando chegas, liga-me.",
      "Quando chegarás, liga-me.",
      "Quando chegar, liga-me.",
    ],
    answer: "Quando chegares, liga-me.",
  },
  {
    id: "b2-choice-boleia",
    level: "B2",
    kind: "choice",
    promptEn: "You want to ask a friend for a lift. What do you say in Portugal?",
    options: [
      "Dás-me boleia?",
      "Me dá uma carona?",
      "Fazes-me uma boleia?",
      "Dás-me um passeio?",
    ],
    answer: "Dás-me boleia?",
  },
  {
    id: "b2-gap-fosse",
    level: "B2",
    kind: "gap",
    promptEn: "Complete the hypothetical.",
    promptPt: "Se eu ___ rico, comprava uma casa na praia.",
    options: ["fosse", "era", "seria", "for"],
    answer: "fosse",
  },
  {
    id: "b2-gap-por",
    level: "B2",
    kind: "gap",
    promptEn: "Choose the missing preposition.",
    promptPt: "Obrigada ___ teres vindo à festa.",
    options: ["por", "para", "de", "em"],
    answer: "por",
  },
  {
    id: "b2-dict-1",
    level: "B2",
    kind: "dictation",
    promptEn: "Listen and type exactly what you hear.",
    say: "Se tivesse mais tempo aprendia português muito mais depressa",
  },
  {
    id: "b2-write-duvido",
    level: "B2",
    kind: "write",
    promptEn: "Translate: I doubt that they know the way.",
    answer: "Duvido que eles saibam o caminho",
    alsoOk: [
      "Duvido que saibam o caminho",
      "Duvido que elas saibam o caminho",
      "Duvido que eles conheçam o caminho",
    ],
  },
  {
    id: "b2-wb-embora",
    level: "B2",
    kind: "wordbank",
    promptEn: "Build the sentence: Although it was raining, we went to the beach.",
    answer: "Embora estivesse a chover fomos à praia",
    extras: ["chovendo", "estava", "na"],
  },
];
