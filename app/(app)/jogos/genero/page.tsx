import { GameGenero } from "@/components/game-genero";
import { UnitReturn } from "@/components/unit-return";
import { requireSession } from "@/lib/auth";
import { genderRounds } from "@/lib/game-data";
import { unitContextFrom } from "@/lib/unit-context";

export const metadata = { title: "O ou A?" };

export default async function GeneroPage(props: PageProps<"/jogos/genero">) {
  await requireSession();
  const searchParams = await props.searchParams;
  const [unit, rounds] = await Promise.all([
    unitContextFrom(searchParams),
    genderRounds(20),
  ]);

  return (
    <div className="space-y-5">
      <UnitReturn unit={unit} />
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          ⚖️ O ou A?
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Gender, fast. Nobody corrects “a problema” in conversation, so it
          sticks — this is how you unstick it.
        </p>
      </header>
      <GameGenero rounds={rounds} unit={unit} />
    </div>
  );
}
