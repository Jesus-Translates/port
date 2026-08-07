import Link from "next/link";
import { sql } from "drizzle-orm";
import { FalarModes } from "@/components/falar-modes";
import { requireSession } from "@/lib/auth";
import { getDb, refEntries } from "@/lib/db";

export const metadata = { title: "Falar" };

const STARTER_QUESTIONS = [
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
    pt: "Imagina que estás num café em Santa Cruz. O que pedes e porquê?",
    en: "You're at a café in Santa Cruz. What do you order and why?",
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
          Responder: Luna asks, you answer out loud and get bilingual feedback.
          Ler: read a sentence aloud and get a pronunciation score with tips.
        </p>
      </header>

      <FalarModes readAloud={readAloud} starterQuestions={STARTER_QUESTIONS} />
    </div>
  );
}
