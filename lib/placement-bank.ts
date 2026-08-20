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
      "Em casa, nós falamos português",
      "A gente fala português em casa",
    ],
  },
  {
    id: "a1-wb-sou-de-portugal",
    level: "A1",
    kind: "wordbank",
    promptEn: "Build the sentence: I am from Portugal.",
    // "Eu" is deliberately NOT a tile. Portuguese drops the subject pronoun,
    // so both "Sou de Portugal" and "Eu sou de Portugal" are correct — and a
    // word bank can only accept the arrangements its tiles allow. Offering
    // "Eu" meant marking the more natural sentence wrong.
    answer: "Sou de Portugal",
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
      // "vou de comboio" and the present-for-scheduled-future are both
      // ordinary EP for a planned trip; failing them costs a whole level.
      "Vou de comboio amanhã",
      "Amanhã vou de comboio",
      "Eu vou de comboio amanhã",
      "Apanho o comboio amanhã",
      "Amanhã apanho o comboio",
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
      // Was "Quando era pequeno, morei perto do mar." — defensible Portuguese
      // for a bounded stay, so a learner with GOOD Portuguese could pick it.
      // A distractor has to be wrong, not merely less idiomatic.
      "Quando fui pequeno, morava perto do mar.",
      "Quando sou pequeno, moro perto do mar.",
    ],
    answer: "Quando era pequeno, morava perto do mar.",
  },
  {
    /*
     * Was a "Chamo-me Rita." clitic item — a first-lesson formula sitting in
     * the B1 block, so it measured nothing about a B1 learner. The EP/BR
     * clitic discrimination it carried is still tested at this level by
     * b1-gap-clitic-te, which now asks about placement in whole sentences.
     *
     * Replaced with the pretérito perfeito composto, which is one of the
     * strongest B1 signals there is: its meaning in Portuguese ("have been
     * doing, repeatedly, lately") does not match the English present perfect,
     * so it is the tense learners get wrong long after they can conjugate it.
     */
    id: "b1-gap-tenho-trabalhado",
    level: "B1",
    kind: "gap",
    promptEn: "Complete: Lately I have been working a lot in the garden.",
    promptPt: "Ultimamente ___ muito no jardim.",
    options: ["tenho trabalhado", "trabalhava", "tenho trabalhando", "trabalharei"],
    answer: "tenho trabalhado",
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
    kind: "choice",
    // Was a gap with the blank fixed BEFORE the verb — which answered its own
    // question ("where does the pronoun go?") and rendered one option as the
    // nonsense "Não -te esqueças". Whole sentences make the placement the
    // actual choice: proclisis after "não" is the rule pt-lint exists to catch.
    promptEn: "Where does the pronoun go? Pick the correct sentence.",
    options: [
      "Não te esqueças de trazer o telemóvel.",
      "Não esqueças-te de trazer o telemóvel.",
      "Não tu esqueças de trazer o telemóvel.",
      "Não esqueças de ti trazer o telemóvel.",
    ],
    answer: "Não te esqueças de trazer o telemóvel.",
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
      // Bare "faz favor" is everyday spoken EP; "faz" vs "por" is three edits,
      // so without this it failed outright.
      "Dá-me as chaves, faz favor",
      "Dá-me as chaves faz favor",
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
      // Was "Quando chegar, liga-me." — grammatical as 1st/3rd person, so it
      // was a second right answer for anyone reading it that way.
      "Quando tu chegar, liga-me.",
    ],
    answer: "Quando chegares, liga-me.",
  },
  {
    /*
     * Was the boleia/carona vocabulary item — a good EP/BR discrimination, but
     * single-word recognition with no grammar load, which is B1 work at most.
     * Replaced with talvez, which takes the conjuntivo in Portuguese even
     * though "maybe" takes nothing in English — a B2 reflex that recognition
     * items cannot fake.
     */
    id: "b2-gap-talvez",
    level: "B2",
    kind: "gap",
    promptEn: "Complete with the right form of 'vir'.",
    promptPt: "Talvez ela ___ mais tarde.",
    options: ["venha", "vem", "virá", "vinha"],
    answer: "venha",
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
      // conhecer is as good as saber here, and each variant needs its own
      // entry — the grader compares whole sentences, not word sets.
      "Duvido que conheçam o caminho",
      "Duvido que eles conheçam o caminho",
      "Duvido que elas conheçam o caminho",
      "Duvido que eles conheçam o caminho",
    ],
  },
  {
    id: "b2-wb-embora",
    level: "B2",
    kind: "wordbank",
    promptEn: "Build the sentence: Although it was raining, we went to the beach.",
    answer: "Embora estivesse a chover fomos à praia",
    // The concessive clause may lead or follow; both are correct, and the
    // target here is embora + imperfeito do conjuntivo, not clause order.
    alsoOk: ["Fomos à praia embora estivesse a chover"],
    extras: ["chovendo", "estava", "na"],
  },
];
