import Link from "next/link";
import { GameVerbo } from "@/components/game-verbo";
import { UnitReturn } from "@/components/unit-return";
import { requireSession } from "@/lib/auth";
import { getCefrFor } from "@/lib/data";
import { verbRounds } from "@/lib/game-data";
import { unitContextFrom } from "@/lib/unit-context";
import { TENSE_LABEL, type Tense } from "@/lib/verbs";

export const metadata = { title: "Certo ou Errado?" };

/**
 * Which tenses to judge, pitched at the learner's level unless they pick.
 * A1 has no business judging the conjuntivo; B2 learns nothing from presente.
 */
const BY_LEVEL: Record<string, Tense[]> = {
  A1: ["presente"],
  A2: ["presente", "perfeito"],
  B1: ["presente", "perfeito", "imperfeito", "futuro"],
  B2: ["perfeito", "imperfeito", "futuro", "conjuntivo", "imperativo"],
};

const CHOOSABLE: Tense[] = [
  "presente",
  "perfeito",
  "imperfeito",
  "futuro",
  "conjuntivo",
  "imperativo",
];

export default async function VerboPage(props: PageProps<"/jogos/verbo">) {
  const session = await requireSession();
  const searchParams = await props.searchParams;
  const [unit, level] = await Promise.all([
    unitContextFrom(searchParams),
    getCefrFor(session.username),
  ]);

  const raw = searchParams.tempo;
  const asked = Array.isArray(raw) ? raw[0] : raw;
  const chosen = CHOOSABLE.find((t) => t === asked);
  const tenses = chosen ? [chosen] : (BY_LEVEL[level] ?? BY_LEVEL.A2);
  const rounds = verbRounds(tenses, 20);

  return (
    <div className="space-y-5">
      <UnitReturn unit={unit} />
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          🎯 Certo ou Errado?
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Judging a form fast is the skill you use while listening — the verb
          sprint trains producing one, this trains catching one.
        </p>
      </header>

      <nav className="flex flex-wrap gap-2">
        <Link
          href="/jogos/verbo"
          className={`rounded-full border px-3 py-1 text-xs ${
            chosen ? "border-sand" : "border-sage bg-sage-pale font-medium"
          }`}
        >
          Nível {level}
        </Link>
        {CHOOSABLE.map((t) => (
          <Link
            key={t}
            href={`/jogos/verbo?tempo=${t}`}
            className={`rounded-full border px-3 py-1 text-xs ${
              chosen === t ? "border-sage bg-sage-pale font-medium" : "border-sand"
            }`}
          >
            {TENSE_LABEL[t]}
          </Link>
        ))}
      </nav>

      <GameVerbo rounds={rounds} unit={unit} />
    </div>
  );
}
