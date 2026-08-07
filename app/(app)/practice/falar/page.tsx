import Link from "next/link";
import { sql } from "drizzle-orm";
import { AudioButton } from "@/components/audio-button";
import { Recorder } from "@/components/recorder";
import { requireSession } from "@/lib/auth";
import { getDb, refEntries } from "@/lib/db";

export const metadata = { title: "Falar" };

const ORAL_PROMPTS = [
  {
    titlePt: "Apresenta-te",
    pt: "Fala de ti: como te chamas, de onde és, onde moras e o que gostas de fazer.",
    en: "Introduce yourself: name, where you're from, where you live, what you enjoy.",
  },
  {
    titlePt: "O teu dia",
    pt: "Conta como foi o teu dia de ontem, do pequeno-almoço até à noite.",
    en: "Describe your day yesterday, from breakfast to night.",
  },
  {
    titlePt: "No café",
    pt: "Imagina que estás num café em Santa Cruz. Pede uma bebida e um bolo, e pergunta o preço.",
    en: "You're at a café in Santa Cruz. Order a drink and a cake, ask the price.",
  },
  {
    titlePt: "Planos",
    pt: "O que vais fazer no próximo fim de semana? Fala dos teus planos.",
    en: "What are you doing next weekend? Talk about your plans.",
  },
];

export default async function FalarPage() {
  await requireSession();
  const readAloud = await getDb()
    .select({ id: refEntries.id, pt: refEntries.pt, en: refEntries.en })
    .from(refEntries)
    .where(sql`${refEntries.kind} = 'phrase' and length(${refEntries.pt}) between 15 and 80`)
    .orderBy(sql`random()`)
    .limit(3);

  return (
    <div className="space-y-6">
      <header>
        <Link href="/practice" className="text-xs text-ink-faint hover:text-olive">
          ← Praticar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">🎙️ Falar</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Speak out loud — Luna listens and tells you what she understood.
          Reading aloud mirrors the CIPLE oral warm-up; the open prompts mirror
          its conversation part.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Lê em voz alta</h2>
        {readAloud.map((e) => (
          <div key={e.id} className="card space-y-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl">{e.pt}</p>
                <p className="mt-0.5 text-sm text-ink-faint">{e.en}</p>
              </div>
              <AudioButton text={e.pt} />
            </div>
            <Recorder mode="read" target={e.pt} />
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Responde à Luna (estilo CIPLE)</h2>
        {ORAL_PROMPTS.map((p) => (
          <div key={p.titlePt} className="card space-y-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                  {p.titlePt}
                </div>
                <p className="mt-1 font-display text-lg">{p.pt}</p>
                <p className="mt-0.5 text-sm text-ink-faint">{p.en}</p>
              </div>
              <AudioButton text={p.pt} />
            </div>
            <Recorder mode="open" prompt={p.pt} />
          </div>
        ))}
      </section>
    </div>
  );
}
