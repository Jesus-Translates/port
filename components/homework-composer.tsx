"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createHomework } from "@/lib/actions/homework";

export function HomeworkComposer({ initialTopic = "" }: { initialTopic?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"luna" | "class" | null>(
    initialTopic ? "luna" : null
  );
  const [topic, setTopic] = useState(initialTopic);
  const [forEveryone, setForEveryone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function askLuna(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), forEveryone }),
      });
      if (!res.ok) throw new Error();
      const { id } = await res.json();
      router.push(`/homework/${id}`);
    } catch {
      setError("A Luna não respondeu. Tenta outra vez.");
      setBusy(false);
    }
  }

  if (mode === null) {
    return (
      <div className="flex flex-wrap gap-2">
        <button className="btn-terra" onClick={() => setMode("luna")}>
          ✨ Pedir TPC à Luna
        </button>
        <button className="btn-ghost" onClick={() => setMode("class")}>
          📎 Adicionar TPC da aula
        </button>
      </div>
    );
  }

  if (mode === "luna") {
    return (
      <form onSubmit={askLuna} className="card space-y-3 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-52 flex-1">
            <label className="label" htmlFor="hw-topic">
              Tema do TPC
            </label>
            <input
              id="hw-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="input"
              placeholder="ex.: o pretérito perfeito"
              required
            />
          </div>
          <button type="submit" disabled={busy} className="btn-terra">
            {busy ? "A Luna está a escrever…" : "Pedir ✨"}
          </button>
          <button type="button" className="btn-ghost" onClick={() => setMode(null)}>
            Cancelar
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={forEveryone}
            onChange={(e) => setForEveryone(e.target.checked)}
            className="accent-olive"
          />
          Dar o mesmo TPC a toda a família
        </label>
        {error ? <p className="text-sm text-terra-dark">{error}</p> : null}
      </form>
    );
  }

  return (
    <form action={createHomework} className="card space-y-3 p-4">
      <div>
        <label className="label" htmlFor="hw-title">
          Título
        </label>
        <input
          id="hw-title"
          name="title"
          className="input"
          placeholder="ex.: Como foi a tua manhã?"
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="hw-instructions">
          O TPC (copia da aula — markdown ok)
        </label>
        <textarea
          id="hw-instructions"
          name="instructions"
          rows={6}
          className="input resize-y"
          placeholder="Cola aqui o trabalho de casa…"
          required
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary">
          Guardar
        </button>
        <button type="button" className="btn-ghost" onClick={() => setMode(null)}>
          Cancelar
        </button>
      </div>
      <p className="text-xs text-ink-faint">
        💡 Depois de guardar, podes pedir à Luna para “melhorar” o TPC — ela
        acrescenta vocabulário, um exemplo e exercícios extra.
      </p>
    </form>
  );
}
