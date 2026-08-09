"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { completeItem } from "@/lib/actions/course";
import { finishGame } from "@/lib/actions/games";
import { cn } from "@/lib/utils";

type Pair = { pt: string; en: string };
type Tile = { id: number; text: string; lang: "pt" | "en"; pair: number };

/** How long a wrong pair stays red before both tiles flip back. */
const FLASH_MS = 620;
const POP_MS = 380;
/** Fast enough that the clock never looks frozen, and that the time we score
 *  on is the time the learner actually saw. */
const TICK_MS = 250;

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildTiles(pairs: Pair[]): Tile[] {
  const tiles: Tile[] = [];
  pairs.forEach((p, i) => {
    tiles.push({ id: i * 2, text: p.pt, lang: "pt", pair: i });
    tiles.push({ id: i * 2 + 1, text: p.en, lang: "en", pair: i });
  });
  return shuffle(tiles);
}

/**
 * Points out of 100. A clean board at a brisk pace is 100; every wrong tap
 * costs 6, and the clock only starts biting after about six seconds a pair —
 * enough that reading the words carefully is never punished. Never below 10:
 * a bad round should still feel like a round played, not a zero.
 */
export function scorePares(seconds: number, wrong: number, pairs: number) {
  const par = pairs * 6;
  const clockCost = Math.min(30, Math.max(0, Math.round((seconds - par) / 3)));
  const tapCost = Math.min(50, wrong * 6);
  return Math.max(10, 100 - clockCost - tapCost);
}

function clock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
}

export function GamePares({
  topic,
  level,
  nextHref,
  nextLabel,
  unitItemId,
}: {
  topic: string;
  level: string;
  /** Where "Continuar" goes — the unit you came from, or the other game. */
  nextHref: string;
  nextLabel: string;
  /** When launched from a unit path, tick that item off automatically. */
  unitItemId?: number | null;
}) {
  const [round, setRound] = useState(0);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [matched, setMatched] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrongTiles, setWrongTiles] = useState<number[]>([]);
  const [popTiles, setPopTiles] = useState<number[]>([]);
  const [wrongTaps, setWrongTaps] = useState(0);
  const [confused, setConfused] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);

  const [result, setResult] = useState<{ seconds: number; score: number } | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const startedAt = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  /** Every pending flip-back dies with the component — or with the next round. */
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const res = await fetch("/api/ai/game", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ game: "pares", topic, level }),
        });
        const data = (await res.json()) as { pairs?: Pair[]; error?: string };
        if (!alive) return;
        if (!res.ok || !data.pairs?.length) throw new Error(data.error);
        startedAt.current = Date.now();
        setPairs(data.pairs);
        setTiles(buildTiles(data.pairs));
        setLoading(false);
      } catch (e) {
        if (!alive) return;
        setError(
          e instanceof Error && e.message
            ? e.message
            : "Não deu para preparar o jogo. Tenta outra vez."
        );
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [topic, level, round]);

  // The clock only runs while there is a board to play.
  const playing = pairs.length > 0 && !result;
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(
      () => setElapsed(Math.round((Date.now() - startedAt.current) / 1000)),
      TICK_MS
    );
    return () => clearInterval(id);
  }, [playing]);

  /** Deal a fresh board. Called from a tap, so resetting state here is safe. */
  function again() {
    clearTimers();
    setLoading(true);
    setError(null);
    setSaveError(null);
    setPairs([]);
    setTiles([]);
    setMatched([]);
    setPicked(null);
    setWrongTiles([]);
    setPopTiles([]);
    setWrongTaps(0);
    setConfused([]);
    setResult(null);
    setElapsed(0);
    setRound((r) => r + 1);
  }

  async function finish(seconds: number, score: number, missedPairs: number[]) {
    setResult({ seconds, score });
    setSaving(true);
    try {
      // Finishing the activity IS the completion — don't make the learner walk
      // back to the unit and tick a box they already earned.
      if (unitItemId) void completeItem(unitItemId, score).catch(() => {});
      await finishGame(
        "jogo-pares",
        score,
        missedPairs
          .slice(0, 10)
          .map((i) => ({ prompt: pairs[i].en, answer: pairs[i].pt }))
      );
    } catch {
      setSaveError("Ganhaste os pontos, mas não deu para guardar o resultado.");
    } finally {
      setSaving(false);
    }
  }

  function tap(tile: Tile) {
    if (result || wrongTiles.length > 0 || matched.includes(tile.pair)) return;

    if (picked === null) {
      setPicked(tile.id);
      return;
    }
    if (picked === tile.id) {
      setPicked(null);
      return;
    }
    const first = tiles.find((t) => t.id === picked);
    if (!first) {
      setPicked(tile.id);
      return;
    }
    // Two tiles of the same language is not a mistake — it is the learner
    // changing their mind. Move the selection instead of punishing it.
    if (first.lang === tile.lang) {
      setPicked(tile.id);
      return;
    }

    if (first.pair === tile.pair) {
      const next = [...matched, tile.pair];
      setMatched(next);
      setPicked(null);
      setPopTiles([first.id, tile.id]);
      later(() => setPopTiles([]), POP_MS);
      if (next.length === pairs.length) {
        // `elapsed` is the ticking clock the learner just watched, never more
        // than a quarter-second behind — so the score matches what they saw.
        const seconds = Math.max(1, elapsed);
        void finish(seconds, scorePares(seconds, wrongTaps, pairs.length), confused);
      }
      return;
    }

    // Wrong: both meanings were confused, so both go to the review deck.
    setWrongTaps((n) => n + 1);
    setConfused((c) => Array.from(new Set([...c, first.pair, tile.pair])));
    setWrongTiles([first.id, tile.id]);
    later(() => {
      setWrongTiles([]);
      setPicked(null);
    }, FLASH_MS);
  }

  const styles = (
    <style>{`
      @keyframes ph-shake { 15%,85% { transform: translateX(-3px) } 40%,70% { transform: translateX(3px) } }
      @keyframes ph-pop { 45% { transform: scale(1.06) } }
      .ph-shake { animation: ph-shake .32s ease-in-out }
      .ph-pop { animation: ph-pop .38s ease-out }
      @media (prefers-reduced-motion: reduce) { .ph-shake, .ph-pop { animation: none } }
    `}</style>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <p className="text-center text-sm text-ink-soft">
          A baralhar as cartas…{" "}
          <span className="text-ink-faint">dealing the board</span>
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="min-h-16 animate-pulse rounded-xl border border-sand bg-cream/60 sm:min-h-20"
              style={{ animationDelay: `${i * 40}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 text-center">
        <div className="mb-2 text-3xl" aria-hidden>
          🌧️
        </div>
        <p className="text-sm text-terra-dark">{error}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button className="btn-terra" onClick={again}>
            Tentar outra vez ↻
          </button>
          <Link href="/jogos" className="btn-ghost">
            ← Jogos
          </Link>
        </div>
      </div>
    );
  }

  if (result) {
    const emoji = result.score >= 85 ? "🏆" : result.score >= 60 ? "💪" : "🌱";
    return (
      <div className="card p-8 text-center">
        {styles}
        <div className="ph-pop mb-2 text-4xl" aria-hidden>
          {emoji}
        </div>
        <p className="font-display text-3xl font-semibold">{result.score}/100</p>
        <p className="mt-1 text-sm text-ink-soft">
          {pairs.length} pares · {clock(result.seconds)} ·{" "}
          {wrongTaps === 0
            ? "sem erros"
            : `${wrongTaps} ${wrongTaps === 1 ? "erro" : "erros"}`}
        </p>
        <p className="mt-3 text-sm text-ink-soft">
          {saving
            ? "A guardar…"
            : result.score >= 85
              ? "Rapidez e memória — estiveste em grande!"
              : result.score >= 60
                ? "Bem jogado! Mais uma ronda e ficas ainda mais rápido."
                : "Devagar se vai ao longe — os pares que falhaste foram para o teu baralho de revisão."}
        </p>
        {saveError ? (
          <p className="mt-2 text-sm text-terra-dark">{saveError}</p>
        ) : null}
        {/* Forward first: finishing something should always offer the next
            thing, not just a way to repeat what you just did. */}
        <div className="mt-5 space-y-2">
          <Link href={nextHref} className="btn-primary block w-full">
            {nextLabel} →
          </Link>
          <div className="flex flex-wrap justify-center gap-2">
            <button className="btn-ghost" onClick={again} disabled={saving}>
              Jogar outra vez ↻
            </button>
            <Link href="/jogos" className="btn-ghost">
              ← Jogos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {styles}

      <div className="flex items-center gap-2">
        {pairs.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < matched.length ? "bg-olive" : "bg-sand"
            )}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="chip tabular-nums">⏱ {clock(elapsed)}</span>
        <span className="text-xs text-ink-faint">
          {matched.length}/{pairs.length} pares
        </span>
        <span
          className={cn(
            "chip tabular-nums",
            wrongTaps > 0 ? "bg-terra-pale text-terra-dark" : ""
          )}
        >
          ✗ {wrongTaps}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {tiles.map((t) => {
          const isMatched = matched.includes(t.pair);
          const isWrong = wrongTiles.includes(t.id);
          const isPop = popTiles.includes(t.id);
          const isPicked = picked === t.id;
          const idle = !isMatched && !isWrong && !isPicked;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => tap(t)}
              disabled={isMatched}
              aria-pressed={isPicked}
              lang={t.lang === "pt" ? "pt-PT" : "en"}
              className={cn(
                // min-h-16 = 64px, comfortably past the 44px thumb minimum
                "flex min-h-16 items-center justify-center rounded-xl border px-2 py-2 text-center text-[13px] leading-snug text-balance transition-all duration-150 sm:min-h-20 sm:text-sm",
                t.lang === "pt" ? "font-display" : "font-sans",
                isMatched
                  ? "border-olive/40 bg-sage-pale text-olive opacity-60"
                  : isWrong
                    ? "ph-shake border-terra bg-terra-pale font-medium text-terra-dark"
                    : isPicked
                      ? "scale-[0.97] border-azul bg-azul-pale font-medium text-azul"
                      : "border-sand active:scale-95",
                idle && t.lang === "pt" ? "bg-cream text-ink" : "",
                idle && t.lang === "en" ? "bg-white/80 text-ink-soft" : "",
                isPop && "ph-pop"
              )}
            >
              {isMatched ? "✓ " : ""}
              {t.text}
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-ink-faint">
        Toca numa palavra portuguesa e no seu par em inglês.{" "}
        <span className="block sm:inline">
          Tap a Portuguese tile, then its English match.
        </span>
      </p>
    </div>
  );
}
