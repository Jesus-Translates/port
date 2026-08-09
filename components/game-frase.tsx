"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { completeItem } from "@/lib/actions/course";
import { finishGame } from "@/lib/actions/games";
import { cn } from "@/lib/utils";

type Item = { pt: string; en: string; hint: string | null };
type Tile = { id: number; word: string };
type Miss = { prompt: string; answer: string; tip?: string | null };

/** Two decoys per sentence — the reason this teaches instead of just unscrambling. */
const DECOYS = 2;

/** Safe fillers: common pt-PT adverbs, used only when the other sentences in
 *  the round can't supply a decoy that is absent from this one. */
/*
 * There is deliberately NO fallback decoy list.
 *
 * It used to hold "também", "já", "sempre" and friends — adverbs that slot
 * grammatically into almost any Portuguese sentence. A learner who built a
 * perfectly correct sentence containing one was still marked wrong, because
 * the check is an exact match against the target. A round with fewer tiles is
 * strictly better than a round that punishes correct Portuguese, so when the
 * pool of real words from other sentences runs short we simply use fewer.
 */

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** The sentence as tiles. The final . ? ! is stripped so the last word isn't
 *  labelled for free; the capital on the first word is kept, because a tile
 *  reading "praia" when the sentence needs "Praia" would just be a trap. */
function tokensOf(pt: string): string[] {
  return pt
    .replace(/^[“"'«\s]+/, "")
    .replace(/[”"'»\s]+$/, "")
    .split(/\s+/)
    .map((w) => w.replace(/[.!?…]+$/u, ""))
    .filter(Boolean);
}

function endMark(pt: string): string {
  const m = pt.trim().match(/[.!?…]+$/u);
  return m ? m[0] : ".";
}

function norm(w: string): string {
  return w
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

/** Decoys come from the OTHER sentences of the same round: same topic, same
 *  level, real pt-PT — plausible enough to have to be rejected on grammar. */
function decoysFor(index: number, items: Item[]): string[] {
  const own = new Set(tokensOf(items[index].pt).map(norm));
  const pool: string[] = [];
  items.forEach((it, j) => {
    if (j === index) return;
    for (const w of tokensOf(it.pt)) {
      // Skip capitalised words: they are either sentence-initial or proper
      // nouns, and either way they would stand out as obviously foreign.
      if (!/^\p{Ll}/u.test(w)) continue;
      const k = norm(w);
      if (!k || own.has(k)) continue;
      if (pool.some((p) => norm(p) === k)) continue;
      pool.push(w);
    }
  });

  return shuffle(pool).slice(0, DECOYS);
}

function tilesFor(index: number, items: Item[]): Tile[] {
  const words = [...tokensOf(items[index].pt), ...decoysFor(index, items)];
  return shuffle(words).map((word, id) => ({ id, word }));
}

/** First position where the two sentences part company; -1 when identical. */
function diffAt(a: string[], b: string[]): number {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
  return a.length === b.length ? -1 : n;
}

function WordRow({
  title,
  words,
  at,
  tone,
}: {
  title: string;
  words: string[];
  at: number;
  tone: "terra" | "olive";
}) {
  const strong = tone === "terra" ? "bg-terra text-paper" : "bg-olive text-paper";
  const soft =
    tone === "terra" ? "bg-terra-pale text-terra-dark" : "bg-sage-pale text-olive";
  return (
    <div>
      <p className="label">{title}</p>
      <div className="flex flex-wrap gap-1">
        {words.length === 0 ? (
          <span className={cn("rounded-lg px-2 py-1 text-sm", soft)}>—</span>
        ) : null}
        {words.map((w, i) => (
          <span
            key={i}
            className={cn(
              "rounded-lg px-2 py-1 font-display text-sm",
              i === at ? strong : soft
            )}
          >
            {w}
          </span>
        ))}
        {at >= 0 && at >= words.length ? (
          <span className={cn("rounded-lg px-2 py-1 text-sm", strong)}>⌷</span>
        ) : null}
      </div>
    </div>
  );
}

export function GameFrase({
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
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [index, setIndex] = useState(0);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [placed, setPlaced] = useState<number[]>([]);
  const [checked, setChecked] = useState<{
    ok: boolean;
    attempt: string[];
    correct: string[];
  } | null>(null);
  const [marks, setMarks] = useState<boolean[]>([]);
  const [misses, setMisses] = useState<Miss[]>([]);

  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const res = await fetch("/api/ai/game", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ game: "frase", topic, level }),
        });
        const data = (await res.json()) as { items?: Item[]; error?: string };
        if (!alive) return;
        if (!res.ok || !data.items?.length) throw new Error(data.error);
        setItems(data.items);
        setTiles(tilesFor(0, data.items));
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

  /** A fresh set of sentences. Called from a tap, so resetting here is safe. */
  function again() {
    setLoading(true);
    setError(null);
    setSaveError(null);
    setItems([]);
    setTiles([]);
    setPlaced([]);
    setChecked(null);
    setMarks([]);
    setMisses([]);
    setIndex(0);
    setDone(false);
    setRound((r) => r + 1);
  }

  const item = items[index];
  const score = marks.filter(Boolean).length;
  const last = items.length > 0 && index === items.length - 1;

  function place(id: number) {
    if (checked || placed.includes(id)) return;
    setPlaced((p) => [...p, id]);
  }

  function remove(at: number) {
    if (checked) return;
    setPlaced((p) => p.filter((_, i) => i !== at));
  }

  function check() {
    if (!item || checked || placed.length === 0) return;
    const attempt = placed.map(
      (id) => tiles.find((t) => t.id === id)?.word ?? ""
    );
    const correct = tokensOf(item.pt);
    const ok =
      attempt.length === correct.length && attempt.every((w, i) => w === correct[i]);
    setChecked({ ok, attempt, correct });
    setMarks((m) => [...m, ok]);
    if (!ok) {
      setMisses((m) => [
        ...m,
        { prompt: item.en, answer: item.pt, tip: item.hint },
      ]);
    }
  }

  async function next() {
    if (!last) {
      const nextIndex = index + 1;
      setIndex(nextIndex);
      setTiles(tilesFor(nextIndex, items));
      setPlaced([]);
      setChecked(null);
      return;
    }
    setDone(true);
    setSaving(true);
    try {
      // Finishing the activity IS the completion — don't make the learner walk
      // back to the unit and tick a box they already earned.
      const pct = items.length
        ? Math.round((score / items.length) * 100)
        : 0;
      if (unitItemId) void completeItem(unitItemId, pct).catch(() => {});
      // Report the same 0-100 accuracy every other game reports, so two
      // results on the family board mean the same thing.
      await finishGame("jogo-frase", pct, misses);
    } catch {
      setSaveError("Fizeste o teu resultado, mas não deu para o guardar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <p className="text-center text-sm text-ink-soft">
          A cortar as frases em pedaços…{" "}
          <span className="text-ink-faint">building the tiles</span>
        </p>
        <div className="card space-y-3 p-5">
          <div className="h-4 w-2/3 animate-pulse rounded bg-cream" />
          <div className="h-20 animate-pulse rounded-2xl bg-cream/70" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-11 animate-pulse rounded-xl bg-cream"
                style={{ width: `${60 + ((i * 23) % 50)}px`, animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>
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

  if (done) {
    const pct = score / Math.max(items.length, 1);
    return (
      <div className="card p-8 text-center">
        <div className="mb-2 text-4xl" aria-hidden>
          {pct >= 0.85 ? "🏆" : pct >= 0.6 ? "💪" : "🌱"}
        </div>
        <p className="font-display text-3xl font-semibold">
          {score}/{items.length}
        </p>
        <p className="mt-1 text-sm text-ink-soft">frases montadas à primeira</p>
        <p className="mt-3 text-sm text-ink-soft">
          {saving
            ? "A guardar…"
            : pct >= 0.85
              ? "Ordem impecável — as palavras ficaram todas no sítio certo!"
              : pct >= 0.6
                ? "Boa! A ordem das palavras já te sai quase sempre bem."
                : "As frases que falharam foram para o teu baralho de revisão. Vais lá chegar."}
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

  if (!item) return null;

  const at = checked && !checked.ok ? diffAt(checked.attempt, checked.correct) : -1;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {items.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < marks.length
                ? marks[i]
                  ? "bg-olive"
                  : "bg-terra"
                : i === index
                  ? "bg-azul"
                  : "bg-sand"
            )}
          />
        ))}
      </div>

      <div className="card space-y-4 p-5">
        <div>
          <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
            Frase {index + 1} de {items.length}
          </p>
          <p className="mt-1 font-display text-xl leading-snug">“{item.en}”</p>
          {item.hint ? (
            <p className="mt-2 text-xs text-ink-soft">💡 {item.hint}</p>
          ) : null}
        </div>

        {/* The tray. Fixed minimum height so nothing jumps as tiles land. */}
        <div
          className={cn(
            "flex min-h-20 flex-wrap content-start gap-2 rounded-2xl border-2 border-dashed p-2 transition-colors",
            checked
              ? checked.ok
                ? "border-olive/50 bg-sage-pale/60"
                : "border-terra/50 bg-terra-pale/50"
              : "border-sand bg-cream/40"
          )}
        >
          {placed.length === 0 ? (
            <span className="px-2 py-2 text-sm text-ink-faint">
              Toca nas palavras para montar a frase…
            </span>
          ) : null}
          {placed.map((id, i) => (
            <button
              key={`${id}-${i}`}
              type="button"
              onClick={() => remove(i)}
              disabled={!!checked}
              lang="pt-PT"
              className={cn(
                "min-h-11 rounded-xl border px-3 py-2 font-display text-sm transition-all",
                checked
                  ? "border-sand bg-white/70 text-ink"
                  : "border-sage bg-white text-ink active:scale-95"
              )}
            >
              {tiles.find((t) => t.id === id)?.word}
            </button>
          ))}
        </div>

        {/* The bank. Used tiles stay in place as invisible ghosts so the
            remaining ones never shift under a thumb mid-tap. */}
        <div className="flex flex-wrap gap-2">
          {tiles.map((t) => {
            const used = placed.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => place(t.id)}
                disabled={used || !!checked}
                aria-hidden={used}
                tabIndex={used ? -1 : undefined}
                lang="pt-PT"
                className={cn(
                  "min-h-11 rounded-xl border px-3 py-2 font-display text-sm transition-all",
                  used
                    ? "invisible"
                    : "border-sand bg-cream text-ink hover:border-sage active:scale-95"
                )}
              >
                {t.word}
              </button>
            );
          })}
        </div>

        {!checked && placed.length > 0 ? (
          <button
            type="button"
            className="text-xs text-ink-faint underline underline-offset-2 hover:text-terra"
            onClick={() => setPlaced([])}
          >
            ↺ Limpar
          </button>
        ) : null}

        {checked ? (
          checked.ok ? (
            <div className="rounded-xl bg-sage-pale px-3 py-2 text-sm text-olive">
              Certo! ✓{" "}
              <span className="font-display">
                {checked.correct.join(" ")}
                {endMark(item.pt)}
              </span>
            </div>
          ) : (
            <div className="space-y-3 rounded-xl bg-terra-pale/50 px-3 py-3">
              <WordRow
                title="A tua frase"
                words={checked.attempt}
                at={at}
                tone="terra"
              />
              <WordRow
                title="A frase certa"
                words={checked.correct}
                at={at}
                tone="olive"
              />
              <p className="text-xs text-terra-dark">
                A primeira palavra diferente está marcada.{" "}
                <span className="text-ink-soft">
                  That highlighted word is where the two sentences part company.
                </span>
              </p>
            </div>
          )
        ) : null}
      </div>

      {!checked ? (
        <button
          className="btn-terra w-full"
          onClick={check}
          disabled={placed.length === 0}
        >
          Corrigir ✓
        </button>
      ) : (
        <button className="btn-primary w-full" onClick={() => void next()}>
          {last ? "Terminar" : "Próxima frase →"}
        </button>
      )}
    </div>
  );
}
