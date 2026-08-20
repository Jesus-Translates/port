"use client";

import { useState } from "react";
import { Bi } from "@/components/bilingual";
import { completeItem } from "@/lib/actions/course";
import { finishGame } from "@/lib/actions/games";
import { GameProgress, GameResult } from "@/components/game-shell";
import type { VerbRound } from "@/lib/game-data";
import type { UnitContext } from "@/lib/unit-context";

/**
 * "Certo ou Errado?" — is this conjugation right?
 *
 * The verb sprint trains PRODUCING one form at a time. This trains judging one
 * fast, which is the skill you actually use while listening. Every wrong form
 * shown here is a real form borrowed from another person in the same
 * hand-checked row, so the learner never sees invented Portuguese.
 */
export function GameVerbo({
  rounds,
  unit,
}: {
  rounds: VerbRound[];
  unit: UnitContext | null;
}) {
  const [at, setAt] = useState(0);
  const [right, setRight] = useState(0);
  const [misses, setMisses] = useState<{ pt: string; en: string }[]>([]);
  const [verdict, setVerdict] = useState<"right" | "wrong" | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const round = rounds[at];
  const finished = at >= rounds.length;

  function answer(saysCorrect: boolean) {
    if (verdict || !round) return;
    const ok = saysCorrect === round.isCorrect;
    const nextRight = ok ? right + 1 : right;
    const nextMisses = ok
      ? misses
      : [
          ...misses,
          {
            pt: `${round.person} ${round.correct}`,
            en: `${round.infinitive} · ${round.tenseLabel}`,
          },
        ];
    setVerdict(ok ? "right" : "wrong");
    setRight(nextRight);
    setMisses(nextMisses);
    // A wrong judgment earns a longer look at the right answer.
    setTimeout(
      () => {
        setVerdict(null);
        setAt(at + 1);
        if (at + 1 >= rounds.length) void save(nextRight, nextMisses);
      },
      ok ? 600 : 1600
    );
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
        "jogo-verbo",
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
        Não há formas suficientes para este tempo verbal.
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
        replayHref="/jogos/verbo"
        unit={unit}
        saving={saving}
        saveError={saveError}
      />
    );
  }

  return (
    <div className="space-y-5">
      <GameProgress at={at} of={rounds.length} />

      <section
        className={`card flex min-h-[10rem] flex-col items-center justify-center p-6 text-center transition-colors ${
          verdict === "right"
            ? "bg-sage-pale"
            : verdict === "wrong"
              ? "bg-terra-pale"
              : ""
        }`}
      >
        <span className="rounded-full bg-sand/60 px-2 py-0.5 text-xs text-ink-soft">
          {round.infinitive} · {round.tenseLabel}
        </span>
        <p className="mt-3 font-display text-3xl font-semibold tracking-tight">
          {round.person} {round.shown}
        </p>
        {verdict && !round.isCorrect && (
          <p className="mt-2 text-sm text-terra">
            certo: <strong>{round.person} {round.correct}</strong>
          </p>
        )}
        {verdict && round.isCorrect && (
          <p className="mt-2 text-sm text-sage">estava certo</p>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={Boolean(verdict)}
          onClick={() => answer(true)}
          className="rounded-2xl border border-sand bg-white py-7 text-lg font-semibold transition-colors hover:border-sage active:bg-sage-pale disabled:opacity-60"
        >
          <Bi pt="✓ Certo" en="Correct" inline />
        </button>
        <button
          type="button"
          disabled={Boolean(verdict)}
          onClick={() => answer(false)}
          className="rounded-2xl border border-sand bg-white py-7 text-lg font-semibold transition-colors hover:border-terra active:bg-terra-pale disabled:opacity-60"
        >
          <Bi pt="✗ Errado" en="Wrong" inline />
        </button>
      </div>
    </div>
  );
}
