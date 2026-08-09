"use client";

import { useState } from "react";
import { completeItem } from "@/lib/actions/course";
import { finishGame } from "@/lib/actions/games";
import { GameProgress, GameResult } from "@/components/game-shell";
import type { ReplyRound } from "@/lib/game-data";
import type { UnitContext } from "@/lib/unit-context";

/**
 * "Responde!" — someone speaks to you, pick the reply a real person would give.
 *
 * This is the reflex conversation actually needs: not vocabulary, but knowing
 * that "Boa tarde, diga?" wants an order and not a greeting back. Conversa
 * trains it open-endedly at a model call per turn; this trains it for nothing,
 * from reply pairs the phrasebook has always held.
 *
 * The English gloss is hidden until you answer, so the round is played in
 * Portuguese and reviewed in English.
 */
export function GameResponde({
  rounds,
  unit,
}: {
  rounds: ReplyRound[];
  unit: UnitContext | null;
}) {
  const [at, setAt] = useState(0);
  const [right, setRight] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [misses, setMisses] = useState<{ pt: string; en: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const round = rounds[at];
  const finished = at >= rounds.length;

  function pick(i: number) {
    if (picked !== null || !round) return;
    setPicked(i);
    if (i === round.correctIndex) {
      setRight((n) => n + 1);
    } else {
      setMisses((m) => [
        ...m,
        {
          pt: `${round.prompt} — ${round.options[round.correctIndex].pt}`,
          en: round.promptEn,
        },
      ]);
    }
  }

  function next() {
    const nextAt = at + 1;
    setPicked(null);
    setAt(nextAt);
    if (nextAt >= rounds.length) void save();
  }

  async function save() {
    const score = Math.round((right / rounds.length) * 100);
    setSaving(true);
    try {
      await finishGame(
        "jogo-responde",
        score,
        misses.map((m) => ({ prompt: m.en, answer: m.pt }))
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
        Ainda não há pares de pergunta e resposta suficientes no livro.
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
        replayHref="/jogos/responde"
        unit={unit}
        saving={saving}
        saveError={saveError}
      />
    );
  }

  return (
    <div className="space-y-5">
      <GameProgress at={at} of={rounds.length} />

      <section className="card p-6 text-center">
        <p className="text-xs tracking-widest text-ink-faint uppercase">
          Alguém te diz
        </p>
        <p className="mt-2 font-display text-2xl font-semibold tracking-tight">
          {round.prompt}
        </p>
        {picked !== null && (
          <p className="mt-1 text-sm text-ink-soft">{round.promptEn}</p>
        )}
      </section>

      <p className="text-center text-sm text-ink-soft">
        O que respondes?
      </p>

      <div className="space-y-2">
        {round.options.map((o, i) => {
          const isRight = i === round.correctIndex;
          const chosen = picked === i;
          return (
            <button
              key={i}
              type="button"
              disabled={picked !== null}
              onClick={() => pick(i)}
              className={`block w-full rounded-xl border p-3 text-left transition-colors ${
                picked === null
                  ? "border-sand bg-white hover:border-sage"
                  : isRight
                    ? "border-sage bg-sage-pale"
                    : chosen
                      ? "border-terra bg-terra-pale"
                      : "border-sand bg-white/60 opacity-70"
              }`}
            >
              <span className="block font-medium">{o.pt}</span>
              {picked !== null && o.en ? (
                <span className="block text-xs text-ink-soft">{o.en}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <button type="button" onClick={next} className="btn-primary w-full">
          {at + 1 >= rounds.length ? "Ver resultado →" : "Seguinte →"}
        </button>
      )}
    </div>
  );
}
