import { GameIntruso } from "@/components/game-intruso";
import { UnitReturn } from "@/components/unit-return";
import { requireSession } from "@/lib/auth";
import { intruderRounds } from "@/lib/game-data";
import { unitContextFrom } from "@/lib/unit-context";

export const metadata = { title: "O Intruso" };

export default async function IntrusoPage(props: PageProps<"/jogos/intruso">) {
  await requireSession();
  const searchParams = await props.searchParams;
  const [unit, rounds] = await Promise.all([
    unitContextFrom(searchParams),
    intruderRounds(8),
  ]);

  return (
    <div className="space-y-5">
      <UnitReturn unit={unit} />
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          🕵️ O Intruso
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          No English while you play — group the words in Portuguese and spot
          the one that wandered in from somewhere else.
        </p>
      </header>
      <GameIntruso rounds={rounds} unit={unit} />
    </div>
  );
}
