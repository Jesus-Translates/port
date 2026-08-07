"use client";

import { useState } from "react";
import { AudioButton } from "@/components/audio-button";
import { Recorder } from "@/components/recorder";
import { cn } from "@/lib/utils";

type Phrase = { id: number; pt: string; en: string };
type Question = { titlePt?: string; pt: string; en: string };

export function FalarModes({
  readAloud,
  starterQuestions,
}: {
  readAloud: Phrase[];
  starterQuestions: Question[];
}) {
  const [mode, setMode] = useState<"ler" | "responder">("responder");
  const [questions, setQuestions] = useState<Question[]>(starterQuestions);
  const [fetching, setFetching] = useState(false);

  async function newQuestion() {
    setFetching(true);
    try {
      const res = await fetch("/api/ai/pergunta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error();
      const q = (await res.json()) as { pt: string; en: string };
      setQuestions((qs) => [{ titlePt: "Pergunta da Luna ✨", ...q }, ...qs]);
    } catch {
      // keep the existing list
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

      {mode === "ler" ? (
        <section className="space-y-3">
          {readAloud.map((e) => (
            <div key={e.id} className="card space-y-3 p-5">
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
          <button
            className="btn-terra w-full"
            onClick={newQuestion}
            disabled={fetching}
          >
            {fetching ? "A Luna está a pensar…" : "✨ Nova pergunta da Luna"}
          </button>
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
