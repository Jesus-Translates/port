import Link from "next/link";

type Resource = {
  name: string;
  href: string;
  why: string;
  level: string;
  cost: string;
};

const GROUPS: { title: string; blurb: string; items: Resource[] }[] = [
  {
    title: "Para começar (A1–A2)",
    blurb: "Curto, devagar e explicado — feito para quem ainda está a apanhar o fio.",
    items: [
      {
        name: "Practice Portuguese — Shorties & Podcast",
        href: "https://www.practiceportuguese.com/podcasts/",
        why: "Diálogos curtinhos gravados por portugueses, sobre a vida cá. O áudio é grátis; as transcrições, legendas e exercícios exigem uma subscrição paga.",
        level: "A1–A2",
        cost: "áudio grátis",
      },
      {
        name: "Portuguese With Leo — Beginner Podcast",
        href: "https://www.portuguesewithleo.com/",
        why: "O Leo fala devagar e repete as ideias, com temas de cultura portuguesa. Bom primeiro passo antes do podcast principal.",
        level: "A1–A2",
        cost: "grátis",
      },
      {
        name: "Portuguesepedia — treino de escuta",
        href: "https://portuguesepedia.com/portuguese-listening-skills/",
        why: "Artigos com áudio e estratégias práticas para treinar o ouvido (escuta ativa vs. passiva, o que fazer quando não percebes nada).",
        level: "A1–B1",
        cost: "grátis",
      },
    ],
  },
  {
    title: "Nível a subir (B1+)",
    blurb: "Velocidade normal, frases longas — aqui começas a perder palavras e a ganhar ouvido.",
    items: [
      {
        name: "Portuguese With Leo — podcast principal e YouTube",
        href: "https://www.portuguesewithleo.com/",
        why: "Conversas com convidados sobre história, sotaques e sociedade portuguesa, a ritmo real. Os vídeos do canal têm legendas em português.",
        level: "B1–B2",
        cost: "grátis",
      },
      {
        name: "Practice Portuguese — podcast completo",
        href: "https://www.practiceportuguese.com/podcasts/",
        why: "Episódios longos, dois portugueses a conversar sem travões — humor, gíria e a pronúncia comida do dia a dia.",
        level: "B1–B2",
        cost: "áudio grátis",
      },
    ],
  },
  {
    title: "Autêntico (todos, especialmente os miúdos)",
    blurb: "Nada de material para estrangeiros: é o que os portugueses veem em casa.",
    items: [
      {
        name: "RTP Play",
        href: "https://www.rtp.pt/play/",
        why: "Televisão e rádio públicas em direto e a pedido — notícias, documentários, novelas. Grátis; alguns programas só se veem a partir de Portugal.",
        level: "Todos",
        cost: "grátis",
      },
      {
        name: "RTP Zig Zag",
        href: "https://zigzag.rtp.pt/",
        why: "Desenhos animados e programas infantis em português de Portugal. Frases curtas, muita repetição e imagem a ajudar — ouro para os miúdos e para os adultos também.",
        level: "Todos",
        cost: "grátis",
      },
    ],
  },
];


/**
 * Portuguese from outside the app — radio, podcasts, TV.
 *
 * This used to be its own route, /ouvir, sitting beside /escutar. Two
 * Portuguese verbs for "listen" naming two different pages is unguessable,
 * and /ouvir was reachable only from a hub footnote, so its six genuinely
 * useful resources were effectively hidden. They belong at the bottom of the
 * listening page: finish the app's own dialogues, then here is where to go
 * next.
 */
export function ListeningElsewhere() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold">
          🎧 Fora da app — rádio, podcasts e TV
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Quando os diálogos daqui já forem fáceis, o passo seguinte é ouvir
          português feito para portugueses.
        </p>
      </div>

      {GROUPS.map((g) => (
        <div key={g.title}>
          <h3 className="text-sm font-semibold">{g.title}</h3>
          <p className="mb-2 text-xs text-ink-soft">{g.blurb}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {g.items.map((r) => (
              <a
                key={r.href}
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className="card group p-3 transition-all hover:border-sage hover:shadow-md"
              >
                <span className="block text-sm font-medium group-hover:text-olive">
                  {r.name}
                </span>
                <span className="mt-0.5 block text-xs text-ink-soft">{r.why}</span>
                <span className="mt-1.5 flex gap-2">
                  <span className="chip bg-cream text-ink-soft">{r.level}</span>
                  <span className="chip bg-cream text-ink-soft">{r.cost}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      ))}

      {/* The old tip named Livro and baralho and linked neither. */}
      <p className="text-xs text-ink-faint">
        Ouviste uma palavra nova? Guarda-a n{"\u2019"}
        <Link href="/reference" className="underline underline-offset-2 hover:text-olive">
          O Livro
        </Link>{" "}
        ou manda-a direta para o{" "}
        <Link href="/practice/rever" className="underline underline-offset-2 hover:text-olive">
          teu baralho
        </Link>
        .
      </p>
    </section>
  );
}
