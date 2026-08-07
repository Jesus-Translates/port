"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StoryGenerate({ seriesTitles }: { seriesTitles: string[] }) {
  const router = useRouter();
  const [series, setSeries] = useState(seriesTitles[0] ?? "");
  const [theme, setTheme] = useState("");
  const [level, setLevel] = useState("A2");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(continueSeries: boolean) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          continueSeries && series
            ? { seriesTitle: series, level }
            : { level, theme: theme.trim() || undefined }
        ),
      });
      if (!res.ok) throw new Error();
      const { id } = await res.json();
      router.push(`/stories/${id}`);
    } catch {
      setError("A Luna não conseguiu escrever agora. Tenta outra vez.");
      setBusy(false);
    }
  }

  return (
    <div className="card space-y-3 p-4">
      <div className="flex flex-wrap items-end gap-3">
        {seriesTitles.length > 0 ? (
          <div className="min-w-44 flex-1">
            <label className="label">Continuar série</label>
            <select
              value={series}
              onChange={(e) => setSeries(e.target.value)}
              className="input"
            >
              {seriesTitles.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        ) : null}
        <div>
          <label className="label">Nível</label>
          <select
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
        {seriesTitles.length > 0 ? (
          <button
            className="btn-terra"
            disabled={busy || !series}
            onClick={() => create(true)}
          >
            {busy ? "A Luna está a escrever…" : "Próximo capítulo ✨"}
          </button>
        ) : null}
      </div>
      <div className="flex flex-wrap items-end gap-3 border-t border-sand/70 pt-3">
        <div className="min-w-44 flex-1">
          <label className="label">…ou nova série sobre</label>
          <input
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="input"
            placeholder="ex.: os vizinhos e o mercado de sábado"
          />
        </div>
        <button
          className="btn-ghost"
          disabled={busy}
          onClick={() => create(false)}
        >
          {busy ? "…" : "Começar série nova"}
        </button>
      </div>
      {error ? <p className="text-sm text-terra-dark">{error}</p> : null}
    </div>
  );
}
