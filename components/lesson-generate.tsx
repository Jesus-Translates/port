"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LessonGenerate({ initialTopic = "" }: { initialTopic?: string }) {
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
      const res = await fetch("/api/ai/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), level }),
      });
      if (!res.ok) throw new Error();
      const { id } = await res.json();
      router.push(`/workbook/${id}`);
    } catch {
      setError("A Luna não conseguiu criar a lição. Tenta outra vez.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={create} className="card flex flex-wrap items-end gap-3 p-4">
      <div className="min-w-52 flex-1">
        <label className="label" htmlFor="lesson-topic">
          Nova lição sobre… · New lesson about…
        </label>
        <input
          id="lesson-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="input"
          placeholder="ex.: ir ao médico"
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="lesson-level">
          Nível
        </label>
        <select
          id="lesson-level"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="input"
        >
          <option>A1</option>
          <option>A2</option>
          <option>B1</option>
          <option>B2</option>
        </select>
      </div>
      <button type="submit" disabled={busy} className="btn-terra">
        {busy ? "A Luna está a preparar a lição…" : "Criar lição ✨"}
      </button>
      {error ? <p className="w-full text-sm text-terra-dark">{error}</p> : null}
    </form>
  );
}
