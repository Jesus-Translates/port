"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AudioButton } from "@/components/audio-button";
import { UnitContinue } from "@/components/unit-return";
import { completeItem } from "@/lib/actions/course";
import { finishDitado, gradeDitado } from "@/lib/actions/ditado";
import type { DitadoResult } from "@/lib/ditado";
import type { UnitContext } from "@/lib/unit-context";
import { cn } from "@/lib/utils";

type Sentence = { id: number; en: string };

export function DitadoPlayer({
  sentences,
  unit = null,
}: {
  sentences: Sentence[];
  /** The unit path step this dictation is fulfilling, when there is one. */
  unit?: UnitContext | null;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<DitadoResult | null>(null);
  const [results, setResults] = useState<(DitadoResult & { en: string })[]>([]);
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);

  const sentence = sentences[index];
  const last = index === sentences.length - 1;

  async function check() {
    if (!typed.trim() || busy) return;
    setBusy(true);
    const r = await gradeDitado(sentence.id, typed);
    setBusy(false);
    if (r) {
      setResult(r);
      setResults((rs) => [...rs, { ...r, en: sentence.en }]);
    }
  }

  async function next() {
    if (last) {
      const score = results.reduce((s, r) => s + r.score, 0);
      const total = results.reduce((s, r) => s + r.total, 0);
      const missed = results
        .filter((r) => r.score < r.total)
        .map((r) => ({ pt: r.targetPt, en: r.en }));
      setFinished(true);
      // The round is the step: finishing it ticks the unit item, defensively —
      // a failed tick must never cost the learner the dictation they just did.
      if (unit?.itemId) {
        const pct = total > 0 ? Math.round((score / total) * 100) : 0;
        void completeItem(unit.itemId, pct).catch(() => {});
      }
      await finishDitado(score, total, missed);
    } else {
      setIndex((i) => i + 1);
      setTyped("");
      setResult(null);
    }
  }

  if (finished) {
    const score = results.reduce((s, r) => s + r.score, 0);
    const total = results.reduce((s, r) => s + r.total, 0);
    const pct = total > 0 ? score / total : 0;
    return (
      <div className="card p-8 text-center">
        <div className="mb-2 text-4xl" aria-hidden>
          {pct >= 0.85 ? "🏆" : pct >= 0.6 ? "💪" : "🌱"}
        </div>
        <p className="font-display text-2xl font-semibold">
          {score}/{total} palavras
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          {pct >= 0.85
            ? "Ouvido afinado! Fantástico."
            : "As frases falhadas foram para o teu baralho de revisão."}
        </p>
        {/* Back to the course first when a unit sent you here. */}
        <div className="mt-5 space-y-2">
          <UnitContinue unit={unit} />
          <button
            className={cn("w-full", unit ? "btn-ghost" : "btn-primary")}
            onClick={() => router.refresh()}
          >
            Outro ditado →
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
              i < index ? "bg-olive" : i === index ? "bg-terra" : "bg-sand"
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
        <p className="mt-2 text-sm text-ink-soft italic">“{sentence.en}”</p>

        <textarea
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") check();
          }}
          rows={2}
          disabled={!!result}
          className="input mt-4 resize-y"
          placeholder="Escreve exatamente o que ouves…"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />

        {result ? (
          <div className="mt-3 space-y-2">
            <p className="flex flex-wrap gap-x-1.5 gap-y-1 font-display text-lg">
              {result.words.map((w, i) => (
                <span
                  key={i}
                  className={cn(
                    "rounded px-0.5",
                    w.ok ? "text-olive" : "bg-terra-pale text-terra-dark line-through decoration-terra/50"
                  )}
                >
                  {w.word}
                </span>
              ))}
            </p>
            <p className="text-sm text-ink-soft">
              {result.score}/{result.total} palavras certas
              {result.score === result.total ? " — perfeito! 🎉" : ""}
            </p>
          </div>
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
