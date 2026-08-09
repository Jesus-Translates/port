"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { UnitContext } from "@/lib/unit-context";

const LEVELS = ["A1", "A2", "B1", "B2"];

/**
 * Making the quiz a unit step asked for.
 *
 * Same job as QuizNewForm, one difference that matters: the quiz id only
 * exists after the AI has written the questions, so the unit context has to
 * ride along in the URL we land on — `/practice/<id>?unidade=&item=` — or the
 * finished quiz has no idea which step it just fulfilled.
 */
export function QuizUnitForm({
  unit,
  initialTopic = "",
  initialLevel = "A2",
}: {
  unit: UnitContext;
  initialTopic?: string;
  initialLevel?: string;
}) {
  const router = useRouter();
  const [topic, setTopic] = useState(initialTopic);
  const [level, setLevel] = useState(initialLevel);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const levels = LEVELS.includes(level) ? LEVELS : [level, ...LEVELS];

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), level }),
      });
      const data = (await res.json()) as { id?: number; error?: string };
      if (!res.ok || !data.id) throw new Error(data.error);
      const qs = new URLSearchParams({ unidade: unit.slug });
      if (unit.itemId) qs.set("item", String(unit.itemId));
      router.push(`/practice/${data.id}?${qs.toString()}`);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "A Sandra não conseguiu criar o teste. Tenta outra vez."
      );
      setBusy(false);
    }
  }

  return (
    <form onSubmit={create} className="card space-y-3 p-4">
      <div>
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
      <div className="flex flex-wrap items-end gap-3">
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
            {levels.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={busy} className="btn-terra flex-1">
          {busy ? "A Sandra está a escrever o teste…" : "Criar teste ✨"}
        </button>
      </div>
      {busy ? (
        <p className="text-xs text-ink-faint">
          Uns segundos — as perguntas são escritas de raiz.{" "}
          <span className="block sm:inline">Writing your questions.</span>
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-terra-dark">
          {error}
        </p>
      ) : null}
    </form>
  );
}
