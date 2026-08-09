"use client";

import { useEffect, useState } from "react";
import { completeItem } from "@/lib/actions/course";
import { finishGame } from "@/lib/actions/games";
import { GameProgress, GameResult } from "@/components/game-shell";
import type { GenderRound } from "@/lib/game-data";
import type { UnitContext } from "@/lib/unit-context";

/**
 * "O ou A?" — grammatical gender, at speed.
 *
 * Gender is the mistake that fossilises: nobody corrects "a problema" in
 * conversation, so it survives for years. Nothing else in the app drills it —
 * pares tests meaning, frase tests order. Two big thumb targets and a short
 * clock make it playable one-handed by an adult or a child.
 */
const PER_WORD_MS = 6000;

export function GameGenero({
  rounds,
  unit,
}: {
  rounds: GenderRound[];
  unit: UnitContext | null;
}) {
  const [at, setAt] = useState(0);
  const [right, setRight] = useState(0);
  const [misses, setMisses] = useState<{ pt: string; en: string }[]>([]);
  const [verdict, setVerdict] = useState<"right" | "wrong" | null>(null);
  const [left, setLeft] = useState(PER_WORD_MS);
  // The deadline is set when a round STARTS (an event), so the timer effect
  // only reads it — it never sets state directly in its own body.
  const [deadline, setDeadline] = useState(() => Date.now() + PER_WORD_MS);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const round = rounds[at];
  const finished = at >= rounds.length;
  const plural = round?.article === "os" || round?.article === "as";

  // The clock is per word, and running out counts as a miss — hesitating IS
  // not knowing, which is the whole point of drilling gender for speed.
  useEffect(() => {
    if (finished || verdict) return;
    const id = setInterval(() => {
      const remaining = deadline - Date.now();
      setLeft(remaining);
      if (remaining <= 0) answer("");
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadline, finished, verdict]);

  function answer(choice: string) {
    if (verdict || !round) return;
    const ok = choice === round.article;
    const nextRight = ok ? right + 1 : right;
    const nextMisses = ok
      ? misses
      : [...misses, { pt: `${round.article} ${round.word}`, en: round.en }];
    setVerdict(ok ? "right" : "wrong");
    setRight(nextRight);
    setMisses(nextMisses);

    setTimeout(() => {
      setVerdict(null);
      setAt(at + 1);
      setDeadline(Date.now() + PER_WORD_MS);
      if (at + 1 >= rounds.length) void save(nextRight, nextMisses);
    }, 650);
  }


  /**
   * Saving happens where the last answer happens, not in an effect watching a
   * flag — the round is over because the learner just ended it.
   */
  async function save(
    finalRight: number,
    finalMisses: { pt: string; en: string }[]
  ) {
    const score = Math.round((finalRight / rounds.length) * 100);
    setSaving(true);
    try {
      await finishGame(
        "jogo-genero",
        score,
        finalMisses.map((m) => ({ prompt: m.en, answer: m.pt }))
      );
      if (unit?.itemId) void completeItem(unit.itemId, score).catch(() => {});
    } catch {
      setSaveError("Jogaste bem, mas não deu para guardar o resultado.");
    } finally {
      setSaving(false);
    }
  }

  if (rounds.length === 0) {
    return (
      <p className="card p-5 text-sm text-ink-soft">
        Ainda não há substantivos suficientes no livro para este jogo. Adiciona
        palavras em O Livro e volta cá.
      </p>
    );
  }

  if (finished) {
    return (
      <GameResult
        score={Math.round((right / rounds.length) * 100)}
        right={right}
        total={rounds.length}
        misses={misses}
        replayHref="/jogos/genero"
        unit={unit}
        saving={saving}
        saveError={saveError}
      />
    );
  }

  const pct = Math.max(0, Math.min(100, (left / PER_WORD_MS) * 100));

  return (
    <div className="space-y-5">
      <GameProgress at={at} of={rounds.length} />

      <section
        className={`card flex min-h-[9rem] flex-col items-center justify-center p-6 text-center transition-colors ${
          verdict === "right"
            ? "bg-sage-pale"
            : verdict === "wrong"
              ? "bg-terra-pale"
              : ""
        }`}
      >
        <p className="font-display text-3xl font-semibold tracking-tight">
          {round.word}
        </p>
        <p className="mt-1 text-sm text-ink-soft">{round.en}</p>
        {verdict === "wrong" && (
          <p className="mt-2 text-sm font-medium text-terra">
            {round.article} {round.word}
          </p>
        )}
      </section>

      <div className="h-1 overflow-hidden rounded-full bg-sand">
        <div
          className="h-full bg-terra transition-[width] duration-100 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(plural ? ["os", "as"] : ["o", "a"]).map((a) => (
          <button
            key={a}
            type="button"
            disabled={Boolean(verdict)}
            onClick={() => answer(a)}
            className="rounded-2xl border border-sand bg-white py-8 font-display text-3xl font-semibold transition-colors hover:border-sage active:bg-sage-pale disabled:opacity-60"
          >
            {a}
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-ink-faint">
        {plural ? "Plural — os ou as?" : "Singular — o ou a?"}
      </p>
    </div>
  );
}
