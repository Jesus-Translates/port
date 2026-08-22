/**
 * Field missions: real errands the family can actually run around Santa Cruz,
 * Silveira and Torres Vedras. Hand-written (not AI) so the Portuguese, the
 * shop names and the local etiquette are right — these are the scripts they
 * will say out loud to a real person.
 *
 * Register: "tu" throughout, European Portuguese only.
 */
export type MissionSeed = {
  title: string;
  promptPt: string;
  promptEn: string;
  location: string;
  cefr: string;
  sortOrder: number;
};

export const MISSIONS_SEED: MissionSeed[] = [
  {
    title: "Meia dúzia de pastéis de nata",
    promptPt:
      "Vai à pastelaria e pede meia dúzia de pastéis de nata para levar. Pergunta quanto é e paga. Não te esqueças do «bom dia» à entrada e do «obrigado» à saída.",
    promptEn:
      "Go into the pastelaria and ask for half a dozen pastéis de nata to take away. Ask how much it comes to, and pay. Don't skip the «bom dia» on the way in or the «obrigado/obrigada» on the way out.",
    location: "Pastelaria — Santa Cruz",
    cefr: "A1",
    sortOrder: 1,
  },
  {
    title: "Meio quilo no mercado",
    promptPt:
      "No mercado, escolhe uma banca de fruta ou de legumes. Pergunta quanto custa o quilo, pede meio quilo do que estiver melhor e pede também um saco. No fim diz «é só isso, obrigado».",
    promptEn:
      "At the market, pick a fruit or veg stall. Ask the price per kilo, ask for half a kilo of whatever looks best, and ask for a bag too. Finish with «é só isso, obrigado».",
    location: "Mercado de Santa Cruz",
    cefr: "A1",
    sortOrder: 2,
  },
  {
    title: "Um galão e uma torrada",
    promptPt:
      "No café, pede um galão e uma torrada. Depois pergunta se há wi-fi e qual é a palavra-passe. Quando acabares, chama o empregado: «faz favor, a conta».",
    promptEn:
      "At the café, order a galão (milky coffee in a tall glass) and a torrada (buttered toast). Then ask whether there's wifi and what the password is. When you're done, catch the waiter's eye and ask for the bill.",
    location: "Café — Silveira",
    cefr: "A2",
    sortOrder: 3,
  },
  {
    title: "Dói-me a cabeça",
    promptPt:
      "Na farmácia, explica que tens dores de cabeça desde ontem e pergunta se te podem dar alguma coisa. Pergunta também de quantas em quantas horas se toma.",
    promptEn:
      "At the pharmacy, explain that you've had a headache since yesterday and ask whether they can give you something for it. Also ask how many hours to leave between doses.",
    location: "Farmácia — Santa Cruz",
    cefr: "A2",
    sortOrder: 4,
  },
  {
    title: "Quatro bifes de frango, bem fininhos",
    promptPt:
      "No talho, pede quatro bifes de frango e diz que os queres bem fininhos. Quando te perguntarem «mais alguma coisa?», responde que não e agradece.",
    promptEn:
      "At the butcher's, ask for four chicken steaks and say you want them nice and thin. When they ask «mais alguma coisa?», say no and thank them.",
    location: "Talho — Torres Vedras",
    cefr: "A2",
    sortOrder: 5,
  },
  {
    title: "Apresenta-te ao vizinho",
    promptPt:
      "Cumprimenta um vizinho, apresenta-te e diz onde moras e há quanto tempo cá vives. Depois convida-o para tomar um café qualquer dia destes.",
    promptEn:
      "Say hello to a neighbor, introduce yourself, say where you live and how long you've been here. Then invite them for a coffee one of these days.",
    location: "À porta de casa — Silveira",
    cefr: "A2",
    sortOrder: 6,
  },
  {
    title: "Uma encomenda para os Estados Unidos",
    promptPt:
      "Nos CTT, pergunta quanto custa enviar uma encomenda pequena para os Estados Unidos, quanto tempo demora a chegar e se é preciso preencher algum papel para a alfândega.",
    promptEn:
      "At the post office (CTT), ask how much it costs to send a small parcel to the USA, how long it takes to arrive, and whether you need to fill in any customs paperwork.",
    location: "CTT — Torres Vedras",
    cefr: "B1",
    sortOrder: 7,
  },
  {
    title: "Reservar mesa para oito",
    promptPt:
      "Telefona a um restaurante e reserva uma mesa para oito pessoas, para sábado à noite, por volta das oito e meia. Deixa o teu nome e o teu número de telemóvel e pergunta se têm mesa lá fora.",
    promptEn:
      "Phone a restaurant and book a table for eight people for Saturday night, around half past eight. Leave your name and mobile number, and ask whether they have a table outside.",
    location: "Ao telefone — restaurante",
    cefr: "B1",
    sortOrder: 8,
  },
];
