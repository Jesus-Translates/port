"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bi } from "@/components/bilingual";

/** Ask Sandra for a whole unit: Learning Note + an ordered path of activities.
 *  It lands as a draft — the teacher publishes it from the unit page. */
export function UnitGenerate({ level = "A2" }: { level?: string }) {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [cefr, setCefr] = useState(level);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!topic.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/unit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), cefr }),
      });
      if (!res.ok) throw new Error();
      const { slug } = (await res.json()) as { slug: string };
      router.push(`/unidades/${slug}`);
    } catch {
      setError("A Sandra não conseguiu montar a unidade. Tenta outra vez.");
      setBusy(false);
    }
  }

  return (
    <div className="card space-y-3 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-52 flex-1">
          <label className="label" htmlFor="unit-topic">
            Tema da unidade
          </label>
          <input
            id="unit-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") create();
            }}
            className="input"
            placeholder="ex.: o pretérito perfeito · no talho · marcar consultas"
          />
        </div>
        <div>
          <label className="label" htmlFor="unit-cefr">
            Nível
          </label>
          <select
            id="unit-cefr"
            value={cefr}
            onChange={(e) => setCefr(e.target.value)}
            className="input"
          >
            <option>A1</option>
            <option>A2</option>
            <option>B1</option>
            <option>B2</option>
          </select>
        </div>
        <button
          className="btn-terra"
          disabled={busy || !topic.trim()}
          onClick={create}
        >
          {busy ? (
            <Bi pt="A Sandra está a montar…" en="Sandra is putting it together…" inline />
          ) : (
            <Bi pt="✨ Criar unidade" en="Create unit" inline />
          )}
        </button>
      </div>
      <p className="text-xs text-ink-faint">
        New units start as a <strong>rascunho</strong> — a teacher reads
        the note and publishes it to the class.
      </p>
      {error ? <p className="text-sm text-terra-dark">{error}</p> : null}
    </div>
  );
}
