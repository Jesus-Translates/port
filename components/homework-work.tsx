"use client";

import { useState, useTransition } from "react";
import { Markdown } from "@/components/markdown";
import {
  deleteHomework,
  enhanceHomework,
  requestFeedback,
  submitHomework,
} from "@/lib/actions/homework";

export function HomeworkWork({
  homework,
  isOwner,
  ownerName,
}: {
  homework: {
    id: number;
    status: string;
    response: string | null;
    feedback: string | null;
  };
  isOwner: boolean;
  ownerName: string;
}) {
  const [response, setResponse] = useState(homework.response ?? "");
  const [pending, startTransition] = useTransition();
  const [working, setWorking] = useState<"submit" | "enhance" | null>(null);

  function submit() {
    if (!response.trim()) return;
    setWorking("submit");
    startTransition(async () => {
      await submitHomework(homework.id, response);
      setWorking(null);
    });
  }

  function enhance() {
    setWorking("enhance");
    startTransition(async () => {
      await enhanceHomework(homework.id);
      setWorking(null);
    });
  }

  if (pending && working === "submit") {
    return (
      <div className="card p-10 text-center">
        <div className="mb-3 animate-pulse text-4xl" aria-hidden>
          🌙
        </div>
        <p className="font-medium">A Luna está a corrigir o teu trabalho…</p>
        <p className="mt-1 text-sm text-ink-soft">
          Submitting and grading — usually under a minute.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {homework.status === "open" ? (
        isOwner ? (
          <section className="card space-y-3 p-5">
            <h2 className="font-semibold">✍️ A tua resposta</h2>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={10}
              className="input resize-y"
              placeholder="Escreve as tuas respostas em português…"
            />
            <div className="flex flex-wrap gap-2">
              <button
                className="btn-terra"
                onClick={submit}
                disabled={pending || !response.trim()}
              >
                Entregar à Luna ✓
              </button>
              <button className="btn-ghost" onClick={enhance} disabled={pending}>
                {pending && working === "enhance"
                  ? "A Luna está a melhorar…"
                  : "✨ Melhorar o TPC (extras da Luna)"}
              </button>
              <button
                className="btn-ghost text-terra-dark"
                onClick={() => {
                  if (confirm("Apagar este TPC?")) {
                    startTransition(() => deleteHomework(homework.id));
                  }
                }}
                disabled={pending}
              >
                Apagar
              </button>
            </div>
          </section>
        ) : (
          <p className="card p-5 text-sm text-ink-soft">
            <span className="capitalize">{ownerName}</span> ainda não entregou
            este TPC.
          </p>
        )
      ) : (
        <>
          <section className="card p-5">
            <h2 className="mb-2 font-semibold">
              ✍️ Resposta de <span className="capitalize">{ownerName}</span>
            </h2>
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
              {homework.response}
            </p>
          </section>
          {homework.feedback ? (
            <section className="card border-sage bg-sage-pale/40 p-5">
              <h2 className="mb-2 font-semibold">🌙 Feedback da Luna</h2>
              <Markdown>{homework.feedback}</Markdown>
            </section>
          ) : (
            <div className="card space-y-3 p-5">
              <p className="text-sm text-ink-soft">
                Entregue — a correção da Luna ainda não chegou.
              </p>
              {isOwner ? (
                <button
                  className="btn-terra"
                  disabled={pending}
                  onClick={() => startTransition(() => requestFeedback(homework.id))}
                >
                  {pending ? "A Luna está a corrigir…" : "🌙 Pedir a correção"}
                </button>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}
