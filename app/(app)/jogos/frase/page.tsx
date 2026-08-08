import Link from "next/link";
import { GameFrase } from "@/components/game-frase";
import { getMyCefr } from "@/lib/actions/profile";
import { requireSession } from "@/lib/auth";
import { KIND_META } from "@/lib/course";

export const metadata = { title: "Constrói a frase" };

const LEVELS = ["A1", "A2", "B1", "B2"];
/** No topic given (a straight link from a unit path, say) is not an error — it
 *  is just an ordinary day in Santa Cruz. */
const DEFAULT_TOPIC = "um dia normal em casa e na rua";

function one(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : (v ?? "")).trim();
}

export default async function JogoFrasePage(props: PageProps<"/jogos/frase">) {
  await requireSession();
  const sp = await props.searchParams;
  const topic = one(sp.topic).slice(0, 200) || DEFAULT_TOPIC;
  const asked = one(sp.level).toUpperCase();
  const level = LEVELS.includes(asked) ? asked : await getMyCefr();

  // Where "Continuar" goes. A unit path sends ?unidade=<slug>, so finishing
  // the game returns you to the unit to tick it off; otherwise move on to the
  // sibling game carrying the same topic, so momentum is never lost.
  const unidade = one(sp.unidade).slice(0, 120);
  const qs = `topic=${encodeURIComponent(topic)}&level=${encodeURIComponent(level)}`;
  const nextHref = unidade
    ? `/unidades/${encodeURIComponent(unidade)}`
    : `/jogos/pares?${qs}`;
  const nextLabel = unidade ? "Voltar à unidade" : "Jogo dos pares";
  const meta = KIND_META["jogo-frase"];

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
          Monta a frase palavra a palavra. Duas das palavras não pertencem à
          frase — deixa-as no sítio.{" "}
          <span className="text-ink-faint">
            Two of the tiles are decoys: the order has to be right, and so does
            the choice.
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

      <GameFrase
        key={`${topic}|${level}`}
        topic={topic}
        level={level}
        nextHref={nextHref}
        nextLabel={nextLabel}
      />
    </div>
  );
}
