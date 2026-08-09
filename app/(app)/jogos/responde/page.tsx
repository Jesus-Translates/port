import { GameResponde } from "@/components/game-responde";
import { UnitReturn } from "@/components/unit-return";
import { requireSession } from "@/lib/auth";
import { replyRounds } from "@/lib/game-data";
import { unitContextFrom } from "@/lib/unit-context";

export const metadata = { title: "Responde!" };

export default async function RespondePage(props: PageProps<"/jogos/responde">) {
  await requireSession();
  const searchParams = await props.searchParams;
  const [unit, rounds] = await Promise.all([
    unitContextFrom(searchParams),
    replyRounds(8),
  ]);

  return (
    <div className="space-y-5">
      <UnitReturn unit={unit} />
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          🗨️ Responde!
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Someone speaks to you — pick the reply a real person would give. The
          reflex conversation actually needs, and the English stays hidden until
          you answer.
        </p>
      </header>
      <GameResponde rounds={rounds} unit={unit} />
    </div>
  );
}
