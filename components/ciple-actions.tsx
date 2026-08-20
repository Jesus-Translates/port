"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bi } from "@/components/bilingual";

const TASKS = [
  {
    key: "leitura",
    emoji: "📖",
    title: "Compreensão da Leitura",
    weight: "45% (com a Escrita)",
    weightEn: "45% (with Writing)",
    desc: "Short everyday texts — avisos, anúncios, emails — with questions.",
    api: "/api/ai/quiz",
    body: { mode: "ciple-leitura" },
    dest: (id: number) => `/practice/${id}`,
  },
  {
    key: "oral-comp",
    emoji: "🎧",
    title: "Compreensão do Oral",
    weight: "30%",
    weightEn: "30%",
    desc: "Listen to a short dialogue (no reading!) and answer questions.",
    api: "/api/ai/quiz",
    body: { mode: "ciple-listening" },
    dest: (id: number) => `/practice/${id}`,
  },
  {
    key: "escrita",
    emoji: "✍️",
    title: "Expressão Escrita",
    weight: "45% (com a Leitura)",
    weightEn: "45% (with Reading)",
    desc: "Two timed-style writing tasks (25-35 and 60-80 words), graded by Sandra.",
    api: "/api/ai/homework",
    body: { mode: "ciple-escrita" },
    dest: (id: number) => `/homework/${id}`,
  },
  {
    key: "civica",
    emoji: "🇵🇹",
    title: "Cultura e História",
    weight: "novo em 2026",
    weightEn: "new in 2026",
    desc: "The new civic-knowledge angle: symbols, history, geography.",
    api: "/api/ai/quiz",
    body: { mode: "civica", topic: "símbolos e história de Portugal" },
    dest: (id: number) => `/practice/${id}`,
  },
] as const;

export function CipleActions() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(task: (typeof TASKS)[number]) {
    setBusy(task.key);
    setError(null);
    try {
      const res = await fetch(task.api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task.body),
      });
      if (!res.ok) throw new Error();
      const { id } = await res.json();
      router.push(task.dest(id));
    } catch {
      setError("A Sandra não conseguiu preparar o exercício. Tenta outra vez.");
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">
          {error}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {TASKS.map((t) => (
          <div key={t.key} className="card flex flex-col p-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl" aria-hidden>
                {t.emoji}
              </span>
              <span className="chip">
                <Bi pt={t.weight} en={t.weightEn} inline />
              </span>
            </div>
            <h3 className="mt-2 font-semibold">{t.title}</h3>
            <p className="mt-1 flex-1 text-sm text-ink-soft">{t.desc}</p>
            <button
              className="btn-terra mt-3"
              disabled={busy !== null}
              onClick={() => run(t)}
            >
              {busy === t.key ? (
                <Bi pt="A Sandra está a preparar…" en="Sandra is preparing it…" inline />
              ) : (
                <Bi pt="Praticar ✨" en="Practise" inline />
              )}
            </button>
          </div>
        ))}
        <div className="card flex flex-col p-4">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-2xl" aria-hidden>
              🎙️
            </span>
            <span className="chip">25%</span>
          </div>
          <h3 className="mt-2 font-semibold">Produção e Interação Oral</h3>
          <p className="mt-1 flex-1 text-sm text-ink-soft">
            Self-introduction and conversation — practise speaking with Sandra
            listening.
          </p>
          <Link href="/practice/falar" className="btn-primary mt-3">
            <Bi pt="Ir para Falar →" en="Go to Speaking" inline />
          </Link>
        </div>
      </div>
    </div>
  );
}
