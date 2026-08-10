"use client";

import { useState } from "react";
import { AudioButton } from "@/components/audio-button";
import { Recorder } from "@/components/recorder";
import { UnitContinue } from "@/components/unit-return";
import { completeItem } from "@/lib/actions/course";
import type { UnitContext } from "@/lib/unit-context";
import { cn } from "@/lib/utils";

type ReadTarget = { key: string; pt: string; en: string; source?: string };
type Question = { titlePt?: string; pt: string; en: string };

export function FalarModes({
  readAloud,
  starterQuestions,
  initialTopic = "",
  unit = null,
}: {
  readAloud: ReadTarget[];
  starterQuestions: Question[];
  /** The unit item's topic — seeds everything Sandra is asked to write. */
  initialTopic?: string;
  /** The course step this speaking session is fulfilling, when there is one. */
  unit?: UnitContext | null;
}) {
  const [mode, setMode] = useState<"ler" | "responder">("responder");
  const [topic, setTopic] = useState(initialTopic);
  const [questions, setQuestions] = useState<Question[]>(starterQuestions);
  const [targets, setTargets] = useState<ReadTarget[]>(readAloud);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** They have reached for the microphone at least once. The Recorder reports
   *  nothing back, so this is the honest floor for "actually had a go". */
  const [attempted, setAttempted] = useState(false);
  const [ticking, setTicking] = useState(false);
  const [ticked, setTicked] = useState(false);
  const [tickError, setTickError] = useState<string | null>(null);

  async function finishStep() {
    if (!unit?.itemId || ticking || ticked) return;
    setTicking(true);
    setTickError(null);
    try {
      const res = await completeItem(unit.itemId, null);
      if (!res.ok) throw new Error(res.error);
      setTicked(true);
    } catch (e) {
      setTickError(
        e instanceof Error && e.message
          ? e.message
          : "Não deu para marcar o passo. Podes marcá-lo na unidade."
      );
    } finally {
      setTicking(false);
    }
  }

  async function regenerate() {
    setFetching(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/pergunta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: mode === "ler" ? "frases" : "pergunta",
          theme: topic.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      if (mode === "ler") {
        const data = (await res.json()) as { frases: { pt: string; en: string }[] };
        setTargets(
          data.frases.map((f, i) => ({
            key: `gen-${Date.now()}-${i}`,
            pt: f.pt,
            en: f.en,
            source: topic.trim() ? `Tema: ${topic.trim()}` : "Frases novas da Sandra ✨",
          }))
        );
      } else {
        const q = (await res.json()) as { pt: string; en: string };
        setQuestions((qs) => [
          {
            titlePt: topic.trim()
              ? `Sobre «${topic.trim().slice(0, 40)}» ✨`
              : "Pergunta da Sandra ✨",
            ...q,
          },
          ...qs,
        ]);
      }
    } catch {
      setError("A Sandra não respondeu. Tenta outra vez.");
    } finally {
      setFetching(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-sand bg-white/60 p-1.5">
        {(
          [
            { key: "responder", label: "💬 Responder", sub: "a Sandra pergunta, tu respondes" },
            { key: "ler", label: "📄 Ler em voz alta", sub: "pronúncia com nota" },
          ] as const
        ).map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={cn(
              "rounded-xl px-3 py-2.5 text-center transition-colors",
              mode === m.key
                ? "bg-olive text-paper shadow"
                : "text-ink-soft hover:bg-sage-pale"
            )}
          >
            <div className="text-sm font-semibold">{m.label}</div>
            <div
              className={cn(
                "text-2xs",
                mode === m.key ? "text-paper/80" : "text-ink-faint"
              )}
            >
              {m.sub}
            </div>
          </button>
        ))}
      </div>

      <div className="card flex flex-wrap items-end gap-2 p-3">
        <div className="min-w-44 flex-1">
          <label className="label" htmlFor="falar-topic">
            {initialTopic ? "Tema desta unidade" : "Tema (opcional)"}
          </label>
          <input
            id="falar-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="input"
            placeholder="ex.: no talho · o imperfeito · a praia"
          />
        </div>
        <button className="btn-terra" onClick={regenerate} disabled={fetching}>
          {fetching
            ? "A Sandra está a criar…"
            : mode === "ler"
              ? `✨ Novas frases${topic.trim() ? " sobre o tema" : ""}`
              : `✨ Nova pergunta${topic.trim() ? " sobre o tema" : ""}`}
        </button>
        {initialTopic ? (
          <p className="w-full text-xs text-ink-faint">
            Tudo o que a Sandra criar aqui é sobre este tema — muda-o se quiseres
            outra coisa.
          </p>
        ) : null}
        {error ? (
          <p className="w-full text-sm text-terra-dark">{error}</p>
        ) : null}
      </div>

      {mode === "ler" ? (
        <section className="space-y-3">
          {targets.map((e) => (
            <div key={e.key} className="card space-y-3 p-5">
              {e.source ? (
                <span className="chip bg-terra-pale text-terra-dark">
                  {e.source}
                </span>
              ) : null}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xl">{e.pt}</p>
                  <p className="mt-0.5 text-sm text-ink-faint">{e.en}</p>
                </div>
                <AudioButton text={e.pt} />
              </div>
              {/* Recorder reports nothing back, so a tap inside it is the one
                  honest signal that they had a real go at speaking. */}
              <div onPointerDownCapture={() => setAttempted(true)}>
                <Recorder mode="read" target={e.pt} />
              </div>
            </div>
          ))}
        </section>
      ) : (
        <section className="space-y-3">
          {questions.map((p, i) => (
            <div key={`${p.pt}-${i}`} className="card space-y-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  {p.titlePt ? (
                    <div className="text-2xs font-semibold tracking-wide text-ink-faint uppercase">
                      {p.titlePt}
                    </div>
                  ) : null}
                  <p className="mt-1 font-display text-lg">{p.pt}</p>
                  <p className="mt-0.5 text-sm text-ink-faint">{p.en}</p>
                </div>
                <AudioButton text={p.pt} />
              </div>
              <div onPointerDownCapture={() => setAttempted(true)}>
                <Recorder mode="open" prompt={p.pt} />
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Came from a unit path: nothing here grades itself, so the learner
          says when they are done — but only after they have actually reached
          for the microphone. */}
      {unit ? (
        <section className="card space-y-3 p-5">
          <div>
            <h2 className="font-semibold">🏁 Terminar este passo</h2>
            <p className="mt-0.5 text-sm text-ink-soft">
              {ticked
                ? `Passo concluído na unidade ${unit.title}.`
                : attempted
                  ? "Já falaste em voz alta — marca o passo e volta à unidade."
                  : "Grava pelo menos uma resposta em voz alta para terminares este passo."}{" "}
              <span className="text-ink-faint">
                {ticked
                  ? "Done — this step is ticked off."
                  : "Record at least one answer, then mark it done."}
              </span>
            </p>
          </div>
          {ticked ? (
            <UnitContinue unit={unit} />
          ) : (
            <button
              className="btn-primary w-full"
              onClick={() => void finishStep()}
              disabled={!attempted || ticking}
            >
              {ticking ? "A marcar…" : "Já falei — terminar ✓"}
            </button>
          )}
          {tickError ? (
            <p className="rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">
              {tickError}
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
