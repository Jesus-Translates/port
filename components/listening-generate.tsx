"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Ask Sandra for a new two-voice dialogue, then open it. */
export function ListeningGenerate({
  enabled,
  level = "A2",
  initialTopic = "",
}: {
  enabled: boolean;
  /** Carried in from a unit path item, so the box is never blank. */
  initialTopic?: string;
  /** The learner's placement level — the sensible default to generate at. */
  level?: string;
}) {
  const router = useRouter();
  const [topic, setTopic] = useState(initialTopic);
  const [cefr, setCefr] = useState(level);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/listening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() || undefined, cefr }),
      });
      const data = (await res.json()) as { id?: number; error?: string };
      if (!res.ok || !data.id) throw new Error(data.error);
      router.push(`/escutar/${data.id}`);
    } catch (e) {
      setError(
        e instanceof Error && e.message
          ? e.message
          : "Não deu para gravar o diálogo. Tenta outra vez."
      );
      setBusy(false);
    }
  }

  return (
    <div className="card space-y-3 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-44 flex-1">
          <label className="label" htmlFor="escutar-topic">
            Sobre o quê?
          </label>
          <input
            id="escutar-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="input"
            placeholder="ex.: comprar peixe na praça"
            disabled={!enabled || busy}
          />
        </div>
        <div>
          <label className="label" htmlFor="escutar-cefr">
            Nível
          </label>
          <select
            id="escutar-cefr"
            value={cefr}
            onChange={(e) => setCefr(e.target.value)}
            className="input"
            disabled={!enabled || busy}
          >
            <option>A1</option>
            <option>A2</option>
            <option>B1</option>
            <option>B2</option>
          </select>
        </div>
        <button
          className="btn-terra"
          disabled={!enabled || busy}
          onClick={create}
        >
          {busy ? "A gravar o diálogo…" : "Novo diálogo 🎧"}
        </button>
      </div>
      <p className="text-xs text-ink-faint">
        Two voices, real speed, and a transcript that follows along word by word.
      </p>
      {error ? <p className="text-sm text-terra-dark">{error}</p> : null}
    </div>
  );
}
