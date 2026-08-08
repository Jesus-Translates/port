"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AudioButton } from "@/components/audio-button";
import { UnitContinue } from "@/components/unit-return";
import { completeItem } from "@/lib/actions/course";
import { finishCloze, gradeCloze, type ClozeResult } from "@/lib/actions/ditado";
import type { UnitContext } from "@/lib/unit-context";
import { cn } from "@/lib/utils";

export type ClozeSentence = {
  id: number;
  en: string;
  masked: string; // the pt sentence with one word replaced by "____"
  blankIndex: number;
};

const BLANK = "____";

/** Audio-cloze: the whole sentence is on screen except one word, and the
 *  audio plays it in full — the ear has to supply what the eye can't see. */
export function ClozePlayer({
  sentences,
  unit = null,
}: {
  sentences: ClozeSentence[];
  /** The unit path step this round is fulfilling, when there is one. */
  unit?: UnitContext | null;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<ClozeResult | null>(null);
  const [score, setScore] = useState(0);
  const [marks, setMarks] = useState<boolean[]>([]);
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);

  const sentence = sentences[index];
  const last = index === sentences.length - 1;
  const cut = sentence.masked.indexOf(BLANK);
  const before = cut < 0 ? sentence.masked : sentence.masked.slice(0, cut);
  const after = cut < 0 ? "" : sentence.masked.slice(cut + BLANK.length);

  async function check() {
    if (!typed.trim() || busy || result) return;
    setBusy(true);
    const r = await gradeCloze(sentence.id, sentence.blankIndex, typed);
    setBusy(false);
    if (r) {
      setResult(r);
      setMarks((m) => [...m, r.correct]);
      if (r.correct) setScore((s) => s + 1);
    }
  }

  async function next() {
    if (last) {
      setFinished(true);
      // Finishing the round IS the completion — don't make the learner walk
      // back to the unit and tick a box they already earned. Fire and forget:
      // a failed tick must never cost them the round they just played.
      if (unit?.itemId) {
        const pct = Math.round((score / Math.max(sentences.length, 1)) * 100);
        void completeItem(unit.itemId, pct).catch(() => {});
      }
      await finishCloze(score, sentences.length);
    } else {
      setIndex((i) => i + 1);
      setTyped("");
      setResult(null);
    }
  }

  if (finished) {
    const pct = score / Math.max(sentences.length, 1);
    return (
      <div className="card p-8 text-center">
        <div className="mb-2 text-4xl" aria-hidden>
          {pct >= 0.85 ? "🏆" : pct >= 0.6 ? "💪" : "🌱"}
        </div>
        <p className="font-display text-2xl font-semibold">
          {score}/{sentences.length} palavras
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          {pct >= 0.85
            ? "Apanhaste as palavras que ninguém pronuncia. Boa!"
            : "As que falharam foram para o teu baralho de revisão."}
        </p>
        {/* Came from a unit? Then the loudest button goes back to the course,
            not deeper into the tool. */}
        <div className="mt-5 space-y-2">
          <UnitContinue unit={unit} />
          <button
            className={cn("w-full", unit ? "btn-ghost" : "btn-primary")}
            onClick={() => router.refresh()}
          >
            Outras frases →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {sentences.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i < index
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

      <div className="card p-6">
        <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
          Frase {index + 1} de {sentences.length}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <AudioButton entryId={sentence.id} label="Ouvir a frase" />
          <span className="text-xs text-ink-faint">
            (ouve as vezes que precisares)
          </span>
        </div>

        <p className="mt-3 font-display text-xl leading-relaxed">
          {before}
          {result ? (
            <strong
              className={cn(
                "rounded px-1.5 py-0.5 font-semibold",
                result.correct
                  ? "bg-sage-pale text-olive"
                  : "bg-terra-pale text-terra-dark"
              )}
            >
              {result.word}
            </strong>
          ) : (
            <span className="rounded bg-azul-pale px-2 py-0.5 text-azul">
              ____
            </span>
          )}
          {after}
        </p>
        <p className="mt-2 text-sm text-ink-soft italic">“{sentence.en}”</p>

        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (result ? next : check)();
          }}
          disabled={!!result}
          className="input mt-4"
          placeholder="A palavra que falta…"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
        />

        {result ? (
          <p
            className={cn(
              "mt-3 rounded-xl px-3 py-2 text-sm",
              result.correct
                ? "bg-sage-pale text-olive"
                : "bg-terra-pale text-terra-dark"
            )}
          >
            {result.correct ? (
              <>Certo! ✓ {result.word}</>
            ) : (
              <>
                A palavra era{" "}
                <strong className="font-display text-base">{result.word}</strong>
              </>
            )}
          </p>
        ) : null}
      </div>

      {!result ? (
        <button
          className="btn-terra w-full"
          onClick={check}
          disabled={busy || !typed.trim()}
        >
          {busy ? "A corrigir…" : "Corrigir ✓"}
        </button>
      ) : (
        <button className="btn-primary w-full" onClick={next}>
          {last ? "Terminar" : "Próxima frase →"}
        </button>
      )}
    </div>
  );
}
