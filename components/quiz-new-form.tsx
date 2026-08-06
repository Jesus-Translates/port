"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const TOPIC_IDEAS = [
  "a cozinha",
  "no mercado",
  "imprevistos",
  "verbos no passado",
  "o tempo e as estações",
  "no café",
];

export function QuizNewForm({ initialTopic = "" }: { initialTopic?: string }) {
  const router = useRouter();
  const [topic, setTopic] = useState(initialTopic);
  const [level, setLevel] = useState("A2");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), level }),
      });
      if (!res.ok) throw new Error();
      const { id } = await res.json();
      router.push(`/practice/${id}`);
    } catch {
      setError("A Luna não conseguiu criar o teste. Tenta outra vez.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={create} className="card space-y-3 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-52 flex-1">
          <label className="label" htmlFor="quiz-topic">
            Tema · Topic
          </label>
          <input
            id="quiz-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="input"
            placeholder="ex.: fazer compras no mercado"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="quiz-level">
            Nível
          </label>
          <select
            id="quiz-level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="input"
          >
            <option>A1</option>
            <option>A2</option>
            <option>B1</option>
          </select>
        </div>
        <button type="submit" disabled={busy} className="btn-terra">
          {busy ? "A Luna está a escrever o teste…" : "Criar teste ✨"}
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TOPIC_IDEAS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTopic(t)}
            className="rounded-full border border-sand bg-white/60 px-2.5 py-1 text-xs text-ink-soft hover:border-sage hover:bg-sage-pale"
          >
            {t}
          </button>
        ))}
      </div>
      {error ? <p className="text-sm text-terra-dark">{error}</p> : null}
    </form>
  );
}
