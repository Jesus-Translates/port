"use client";

import { useState } from "react";
import { Bi } from "@/components/bilingual";
import { completeItem } from "@/lib/actions/course";
import { finishGame } from "@/lib/actions/games";
import { GameProgress, GameResult } from "@/components/game-shell";
import type { IntruderRound } from "@/lib/game-data";
import type { UnitContext } from "@/lib/unit-context";

/**
 * "O Intruso" — four words, one from somewhere else.
 *
 * The only game with no English on screen while you play: the learner has to
 * group words by meaning IN Portuguese rather than translating each one. The
 * English glosses appear after the answer, which turns every round into a free
 * vocabulary review.
 */
export function GameIntruso({
  rounds,
  unit,
}: {
  rounds: IntruderRound[];
  unit: UnitContext | null;
}) {
  const [at, setAt] = useState(0);
  const [points, setPoints] = useState(0);
  const [right, setRight] = useState(0);
  const [tries, setTries] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [misses, setMisses] = useState<{ pt: string; en: string }[]>([]);
  /** The totals as of the round just finished — what save() must report. */
  const [banked, setBanked] = useState<{
    points: number;
    misses: { pt: string; en: string }[];
  }>({ points: 0, misses: [] });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const round = rounds[at];
  const finished = at >= rounds.length;
  /** Ten for a first-tap answer, five after one wrong tap — same as the others. */
  const MAX = 10;

  function tap(i: number) {
    if (!round || revealed || picked.includes(i)) return;

    if (i === round.intruderIndex) {
      const earned = tries === 0 ? MAX : MAX / 2;
      setPoints(points + earned);
      if (tries === 0) setRight((n) => n + 1);
      setRevealed(true);
      setBanked({ points: points + earned, misses });
      return;
    }

    // First wrong tap: one more go. Second: reveal and bank the confusion.
    if (tries === 0) {
      setTries(1);
      setPicked([i]);
      return;
    }
    const nextMisses = [
      ...misses,
      {
        pt: round.words[round.intruderIndex].pt,
        en: round.words[round.intruderIndex].en,
      },
    ];
    setRevealed(true);
    setMisses(nextMisses);
    setBanked({ points, misses: nextMisses });
  }

  function next() {
    setPicked([]);
    setTries(0);
    setRevealed(false);
    setAt(at + 1);
    if (at + 1 >= rounds.length) void save(banked.points, banked.misses);
  }

  /** Saving belongs to the last tap, not to an effect watching a flag. */
  async function save(
    finalPoints: number,
    finalMisses: { pt: string; en: string }[]
  ) {
    const score = Math.round((finalPoints / (rounds.length * MAX)) * 100);
    setSaving(true);
    try {
      await finishGame(
        "jogo-intruso",
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
        Ainda não há categorias suficientes no livro para este jogo.
      </p>
    );
  }

  if (finished) {
    return (
      <GameResult
        score={Math.round((points / (rounds.length * MAX)) * 100)}
        right={right}
        total={rounds.length}
        misses={misses}
        replayHref="/jogos/intruso"
        unit={unit}
        saving={saving}
        saveError={saveError}
      />
    );
  }

  return (
    <div className="space-y-5">
      <GameProgress at={at} of={rounds.length} />
      <p className="text-center text-sm text-ink-soft">
        Três são da mesma família. Qual é o intruso?
      </p>

      <div className="grid grid-cols-2 gap-3">
        {round.words.map((w, i) => {
          const isIntruder = i === round.intruderIndex;
          const wrongPick = picked.includes(i);
          return (
            <button
              key={i}
              type="button"
              disabled={revealed}
              onClick={() => tap(i)}
              className={`min-h-[6.5rem] rounded-2xl border p-3 text-center transition-colors ${
                revealed && isIntruder
                  ? "border-sage bg-sage-pale"
                  : wrongPick
                    ? "border-terra bg-terra-pale"
                    : "border-sand bg-white hover:border-sage"
              } disabled:opacity-90`}
            >
              <span className="block font-medium leading-snug">{w.pt}</span>
              {revealed && (
                <span className="mt-1 block text-xs text-ink-soft">{w.en}</span>
              )}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="space-y-3">
          <p className="text-center text-sm text-ink-soft">
            Três de <strong>{round.homeCategory}</strong>, um de{" "}
            <strong>{round.intruderCategory}</strong>.
          </p>
          <button
            type="button"
            onClick={next}
            className="btn-primary block w-full text-center"
          >
            {at + 1 >= rounds.length ? (
              <Bi pt="Ver resultado →" en="See result" inline />
            ) : (
              <Bi pt="Seguinte →" en="Next" inline />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
