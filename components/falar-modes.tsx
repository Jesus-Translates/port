"use client";

import { useState } from "react";
import { AudioButton } from "@/components/audio-button";
import { Recorder } from "@/components/recorder";
import { cn } from "@/lib/utils";

type ReadTarget = { key: string; pt: string; en: string; source?: string };
type Question = { titlePt?: string; pt: string; en: string };

export function FalarModes({
  readAloud,
  starterQuestions,
}: {
  readAloud: ReadTarget[];
  starterQuestions: Question[];
}) {
  const [mode, setMode] = useState<"ler" | "responder">("responder");
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState<Question[]>(starterQuestions);
  const [targets, setTargets] = useState<ReadTarget[]>(readAloud);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            source: topic.trim() ? `Tema: ${topic.trim()}` : "Frases novas da Luna ✨",
          }))
        );
      } else {
        const q = (await res.json()) as { pt: string; en: string };
        setQuestions((qs) => [
          {
            titlePt: topic.trim()
              ? `Sobre «${topic.trim().slice(0, 40)}» ✨`
              : "Pergunta da Luna ✨",
            ...q,
          },
          ...qs,
        ]);
      }
    } catch {
      setError("A Luna não respondeu. Tenta outra vez.");
    } finally {
      setFetching(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-sand bg-white/60 p-1.5">
        {(
          [
            { key: "responder", label: "💬 Responder", sub: "a Luna pergunta, tu respondes" },
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
                "text-[10px]",
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
            Tema (opcional)
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
            ? "A Luna está a criar…"
            : mode === "ler"
              ? "✨ Novas frases"
              : "✨ Nova pergunta"}
        </button>
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
              <Recorder mode="read" target={e.pt} />
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
                    <div className="text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                      {p.titlePt}
                    </div>
                  ) : null}
                  <p className="mt-1 font-display text-lg">{p.pt}</p>
                  <p className="mt-0.5 text-sm text-ink-faint">{p.en}</p>
                </div>
                <AudioButton text={p.pt} />
              </div>
              <Recorder mode="open" prompt={p.pt} />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
