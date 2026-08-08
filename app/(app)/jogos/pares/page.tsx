import Link from "next/link";
import { GamePares } from "@/components/game-pares";
import { getMyCefr } from "@/lib/actions/profile";
import { requireSession } from "@/lib/auth";
import { KIND_META } from "@/lib/course";

export const metadata = { title: "Jogo dos pares" };

const LEVELS = ["A1", "A2", "B1", "B2"];
/** No topic given (a straight link from a unit path, say) is not an error — it
 *  is just an ordinary day in Santa Cruz. */
const DEFAULT_TOPIC = "o dia a dia: a casa, o mercado e a praia";

function one(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : (v ?? "")).trim();
}

export default async function JogoParesPage(props: PageProps<"/jogos/pares">) {
  await requireSession();
  const sp = await props.searchParams;
  const topic = one(sp.topic).slice(0, 200) || DEFAULT_TOPIC;
  const asked = one(sp.level).toUpperCase();
  const level = LEVELS.includes(asked) ? asked : await getMyCefr();

  // Where "Continuar" goes. A unit path sends ?unidade=<slug>, so finishing
  // the game returns you to the unit to tick it off; otherwise move on to the
  // sibling game carrying the same topic, so momentum is never lost.
  const unidade = one(sp.unidade).slice(0, 120);
  // The path item this game is fulfilling, so it can tick itself off.
  const itemId = Number(one(sp.item)) || null;
  const qs = `topic=${encodeURIComponent(topic)}&level=${encodeURIComponent(level)}`;
  const nextHref = unidade
    ? `/unidades/${encodeURIComponent(unidade)}`
    : `/jogos/frase?${qs}`;
  const nextLabel = unidade ? "Voltar à unidade" : "Constrói a frase";
  const meta = KIND_META["jogo-pares"];

  return (
    <div className="space-y-5">
      <header>
        <Link href="/jogos" className="text-xs text-ink-faint hover:text-olive">
          ← Jogos
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {meta.emoji} {meta.label}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Toca numa palavra e no seu par. O relógio conta e cada engano custa
          pontos.{" "}
          <span className="text-ink-faint">
            Match all eight pairs — fast, and without guessing.
          </span>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="chip">{level}</span>
          <span className="chip bg-cream text-ink-soft">{topic}</span>
          <Link
            href={`/jogos?topic=${encodeURIComponent(topic)}`}
            className="text-xs text-ink-faint underline underline-offset-2 hover:text-terra"
          >
            trocar de tema
          </Link>
        </div>
      </header>

      <GamePares
        key={`${topic}|${level}`}
        topic={topic}
        level={level}
        nextHref={nextHref}
        nextLabel={nextLabel}
        unitItemId={itemId}
      />
    </div>
  );
}
