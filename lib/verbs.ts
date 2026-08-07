/**
 * Conjugation tables for the drill — European Portuguese forms, hand-checked.
 * Note the EP first-person-plural preterite of -ar verbs: -ámos (falámos),
 * unlike Brazilian -amos. Persons: eu, tu, ele/ela, nós, eles/elas (no vós).
 */

export type Tense = "presente" | "perfeito" | "imperfeito" | "conjuntivo";
export const TENSE_LABEL: Record<Tense, string> = {
  presente: "Presente",
  perfeito: "Pretérito perfeito",
  imperfeito: "Pretérito imperfeito",
  conjuntivo: "Conjuntivo (presente)",
};
export const PERSONS = ["eu", "tu", "ele/ela", "nós", "eles/elas"] as const;

type Forms = [string, string, string, string, string];
export type Verb = {
  inf: string;
  en: string;
  forms: Partial<Record<Tense, Forms>>;
};

export const VERBS: Verb[] = [
  { inf: "ser", en: "to be (permanent)", forms: { presente: ["sou", "és", "é", "somos", "são"], perfeito: ["fui", "foste", "foi", "fomos", "foram"], imperfeito: ["era", "eras", "era", "éramos", "eram"], conjuntivo: ["seja", "sejas", "seja", "sejamos", "sejam"] } },
  { inf: "estar", en: "to be (state)", forms: { presente: ["estou", "estás", "está", "estamos", "estão"], perfeito: ["estive", "estiveste", "esteve", "estivemos", "estiveram"], imperfeito: ["estava", "estavas", "estava", "estávamos", "estavam"], conjuntivo: ["esteja", "estejas", "esteja", "estejamos", "estejam"] } },
  { inf: "ter", en: "to have", forms: { presente: ["tenho", "tens", "tem", "temos", "têm"], perfeito: ["tive", "tiveste", "teve", "tivemos", "tiveram"], imperfeito: ["tinha", "tinhas", "tinha", "tínhamos", "tinham"], conjuntivo: ["tenha", "tenhas", "tenha", "tenhamos", "tenham"] } },
  { inf: "ir", en: "to go", forms: { presente: ["vou", "vais", "vai", "vamos", "vão"], perfeito: ["fui", "foste", "foi", "fomos", "foram"], imperfeito: ["ia", "ias", "ia", "íamos", "iam"], conjuntivo: ["vá", "vás", "vá", "vamos", "vão"] } },
  { inf: "fazer", en: "to do / make", forms: { presente: ["faço", "fazes", "faz", "fazemos", "fazem"], perfeito: ["fiz", "fizeste", "fez", "fizemos", "fizeram"], imperfeito: ["fazia", "fazias", "fazia", "fazíamos", "faziam"], conjuntivo: ["faça", "faças", "faça", "façamos", "façam"] } },
  { inf: "poder", en: "to be able to", forms: { presente: ["posso", "podes", "pode", "podemos", "podem"], perfeito: ["pude", "pudeste", "pôde", "pudemos", "puderam"], imperfeito: ["podia", "podias", "podia", "podíamos", "podiam"], conjuntivo: ["possa", "possas", "possa", "possamos", "possam"] } },
  { inf: "querer", en: "to want", forms: { presente: ["quero", "queres", "quer", "queremos", "querem"], perfeito: ["quis", "quiseste", "quis", "quisemos", "quiseram"], imperfeito: ["queria", "querias", "queria", "queríamos", "queriam"], conjuntivo: ["queira", "queiras", "queira", "queiramos", "queiram"] } },
  { inf: "dizer", en: "to say", forms: { presente: ["digo", "dizes", "diz", "dizemos", "dizem"], perfeito: ["disse", "disseste", "disse", "dissemos", "disseram"], imperfeito: ["dizia", "dizias", "dizia", "dizíamos", "diziam"], conjuntivo: ["diga", "digas", "diga", "digamos", "digam"] } },
  { inf: "ver", en: "to see", forms: { presente: ["vejo", "vês", "vê", "vemos", "veem"], perfeito: ["vi", "viste", "viu", "vimos", "viram"], imperfeito: ["via", "vias", "via", "víamos", "viam"], conjuntivo: ["veja", "vejas", "veja", "vejamos", "vejam"] } },
  { inf: "vir", en: "to come", forms: { presente: ["venho", "vens", "vem", "vimos", "vêm"], perfeito: ["vim", "vieste", "veio", "viemos", "vieram"], imperfeito: ["vinha", "vinhas", "vinha", "vínhamos", "vinham"], conjuntivo: ["venha", "venhas", "venha", "venhamos", "venham"] } },
  { inf: "dar", en: "to give", forms: { presente: ["dou", "dás", "dá", "damos", "dão"], perfeito: ["dei", "deste", "deu", "demos", "deram"], imperfeito: ["dava", "davas", "dava", "dávamos", "davam"], conjuntivo: ["dê", "dês", "dê", "demos", "deem"] } },
  { inf: "saber", en: "to know (facts)", forms: { presente: ["sei", "sabes", "sabe", "sabemos", "sabem"], perfeito: ["soube", "soubeste", "soube", "soubemos", "souberam"], imperfeito: ["sabia", "sabias", "sabia", "sabíamos", "sabiam"], conjuntivo: ["saiba", "saibas", "saiba", "saibamos", "saibam"] } },
  { inf: "pôr", en: "to put", forms: { presente: ["ponho", "pões", "põe", "pomos", "põem"], perfeito: ["pus", "puseste", "pôs", "pusemos", "puseram"], imperfeito: ["punha", "punhas", "punha", "púnhamos", "punham"], conjuntivo: ["ponha", "ponhas", "ponha", "ponhamos", "ponham"] } },
  { inf: "trazer", en: "to bring", forms: { presente: ["trago", "trazes", "traz", "trazemos", "trazem"], perfeito: ["trouxe", "trouxeste", "trouxe", "trouxemos", "trouxeram"], imperfeito: ["trazia", "trazias", "trazia", "trazíamos", "traziam"] } },
  { inf: "ler", en: "to read", forms: { presente: ["leio", "lês", "lê", "lemos", "leem"], perfeito: ["li", "leste", "leu", "lemos", "leram"], imperfeito: ["lia", "lias", "lia", "líamos", "liam"] } },
  { inf: "ouvir", en: "to hear", forms: { presente: ["ouço", "ouves", "ouve", "ouvimos", "ouvem"], perfeito: ["ouvi", "ouviste", "ouviu", "ouvimos", "ouviram"], imperfeito: ["ouvia", "ouvias", "ouvia", "ouvíamos", "ouviam"] } },
  { inf: "pedir", en: "to ask for", forms: { presente: ["peço", "pedes", "pede", "pedimos", "pedem"], perfeito: ["pedi", "pediste", "pediu", "pedimos", "pediram"], imperfeito: ["pedia", "pedias", "pedia", "pedíamos", "pediam"] } },
  { inf: "dormir", en: "to sleep", forms: { presente: ["durmo", "dormes", "dorme", "dormimos", "dormem"], perfeito: ["dormi", "dormiste", "dormiu", "dormimos", "dormiram"], imperfeito: ["dormia", "dormias", "dormia", "dormíamos", "dormiam"] } },
  { inf: "sair", en: "to go out / leave", forms: { presente: ["saio", "sais", "sai", "saímos", "saem"], perfeito: ["saí", "saíste", "saiu", "saímos", "saíram"], imperfeito: ["saía", "saías", "saía", "saíamos", "saíam"] } },
  { inf: "ficar", en: "to stay / become", forms: { presente: ["fico", "ficas", "fica", "ficamos", "ficam"], perfeito: ["fiquei", "ficaste", "ficou", "ficámos", "ficaram"], imperfeito: ["ficava", "ficavas", "ficava", "ficávamos", "ficavam"] } },
  { inf: "começar", en: "to begin", forms: { presente: ["começo", "começas", "começa", "começamos", "começam"], perfeito: ["comecei", "começaste", "começou", "começámos", "começaram"], imperfeito: ["começava", "começavas", "começava", "começávamos", "começavam"] } },
  { inf: "chegar", en: "to arrive", forms: { presente: ["chego", "chegas", "chega", "chegamos", "chegam"], perfeito: ["cheguei", "chegaste", "chegou", "chegámos", "chegaram"], imperfeito: ["chegava", "chegavas", "chegava", "chegávamos", "chegavam"] } },
  { inf: "falar", en: "to speak", forms: { presente: ["falo", "falas", "fala", "falamos", "falam"], perfeito: ["falei", "falaste", "falou", "falámos", "falaram"], imperfeito: ["falava", "falavas", "falava", "falávamos", "falavam"] } },
  { inf: "comer", en: "to eat", forms: { presente: ["como", "comes", "come", "comemos", "comem"], perfeito: ["comi", "comeste", "comeu", "comemos", "comeram"], imperfeito: ["comia", "comias", "comia", "comíamos", "comiam"] } },
  { inf: "abrir", en: "to open", forms: { presente: ["abro", "abres", "abre", "abrimos", "abrem"], perfeito: ["abri", "abriste", "abriu", "abrimos", "abriram"], imperfeito: ["abria", "abrias", "abria", "abríamos", "abriam"] } },
  { inf: "gostar", en: "to like", forms: { presente: ["gosto", "gostas", "gosta", "gostamos", "gostam"], perfeito: ["gostei", "gostaste", "gostou", "gostámos", "gostaram"], imperfeito: ["gostava", "gostavas", "gostava", "gostávamos", "gostavam"] } },
  { inf: "precisar", en: "to need", forms: { presente: ["preciso", "precisas", "precisa", "precisamos", "precisam"], perfeito: ["precisei", "precisaste", "precisou", "precisámos", "precisaram"], imperfeito: ["precisava", "precisavas", "precisava", "precisávamos", "precisavam"] } },
  { inf: "conhecer", en: "to know (people/places)", forms: { presente: ["conheço", "conheces", "conhece", "conhecemos", "conhecem"], perfeito: ["conheci", "conheceste", "conheceu", "conhecemos", "conheceram"], imperfeito: ["conhecia", "conhecias", "conhecia", "conhecíamos", "conheciam"] } },
  { inf: "escrever", en: "to write", forms: { presente: ["escrevo", "escreves", "escreve", "escrevemos", "escrevem"], perfeito: ["escrevi", "escreveste", "escreveu", "escrevemos", "escreveram"], imperfeito: ["escrevia", "escrevias", "escrevia", "escrevíamos", "escreviam"] } },
  { inf: "comprar", en: "to buy", forms: { presente: ["compro", "compras", "compra", "compramos", "compram"], perfeito: ["comprei", "compraste", "comprou", "comprámos", "compraram"], imperfeito: ["comprava", "compravas", "comprava", "comprávamos", "compravam"] } },
];

export function verbsWithTense(tenses: Tense[]): Verb[] {
  return VERBS.filter((v) => tenses.some((t) => v.forms[t]));
}
