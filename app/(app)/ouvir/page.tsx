import { requireSession } from "@/lib/auth";

export const metadata = { title: "Ouvir" };

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

export default async function OuvirPage() {
  await requireSession();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          🎧 Ouvir — ouvido de português
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Sandra speaks clearly on purpose; real Portuguese does not. Nothing
          trains the ear like native audio — the swallowed vowels, the speed,
          two people talking over each other. Everything below lives outside
          this app, and most of it is free.
        </p>
      </header>

      {GROUPS.map((group) => (
        <section key={group.title}>
          <h2 className="font-display text-lg font-semibold">{group.title}</h2>
          <p className="mt-0.5 mb-3 text-sm text-ink-soft">{group.blurb}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {group.items.map((item) => (
              <article key={item.name + item.level} className="card flex flex-col p-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="chip">{item.level}</span>
                  <span className="chip bg-cream text-ink-soft">{item.cost}</span>
                </div>
                <h3 className="mt-2 font-semibold">{item.name}</h3>
                <p className="mt-1 flex-1 text-sm text-ink-soft">{item.why}</p>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost mt-3 self-start"
                >
                  Abrir ↗
                </a>
              </article>
            ))}
          </div>
        </section>
      ))}

      <p className="card p-4 text-sm text-ink-soft">
        Ouviste algo bom? Guarda as palavras novas no Livro ou no baralho.
      </p>
    </div>
  );
}
