"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createHomework } from "@/lib/actions/homework";

export function HomeworkComposer({
  initialTopic = "",
  unitItemId,
  unitSlug,
  canAssignToFamily = false,
}: {
  initialTopic?: string;
  /**
   * Whether this person may give the same TPC to the whole household.
   *
   * Staff only. A student setting homework for their parents and siblings is
   * not a feature, and the checkbox was previously shown to everyone. The API
   * enforces this independently — this prop only decides whether somebody is
   * offered a control that would work for them.
   */
  canAssignToFamily?: boolean;
  /** Set when this TPC fulfils a unit path item, so finishing it ticks the
   *  course forward instead of leaving the bar at zero. */
  unitItemId?: number | null;
  /**
   * The unit that sent us here. Needed as well as the item id: the WORK
   * happens at /homework/[id], and that page rebuilds its unit context from
   * `?unidade=&item=`. Without the slug in the URL the new TPC opened with no
   * course context at all — no "back to the unit", no continue button when
   * you finished, and the step never ticked.
   */
  unitSlug?: string | null;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"sandra" | "class" | null>(
    initialTopic ? "sandra" : null
  );
  const [topic, setTopic] = useState(initialTopic);
  const [forEveryone, setForEveryone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function askSandra(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          forEveryone,
          ...(unitItemId ? { unitItemId } : {}),
        }),
      });
      const data = (await res.json()) as { id?: number; error?: string };
      if (!res.ok || !data.id) throw new Error(data.error);
      const { id } = data;
      // Carry the course context onto the work page, or finishing it has
      // nowhere to go back to.
      const q =
        unitSlug && unitItemId
          ? `?unidade=${encodeURIComponent(unitSlug)}&item=${unitItemId}`
          : "";
      router.push(`/homework/${id}${q}`);
    } catch (e) {
      setError(
        e instanceof Error && e.message
          ? e.message
          : "A Sandra não respondeu. Tenta outra vez."
      );
      setBusy(false);
    }
  }

  if (mode === null) {
    return (
      <div className="flex flex-wrap gap-2">
        <button className="btn-terra" onClick={() => setMode("sandra")}>
          ✨ Pedir TPC à Sandra
        </button>
        <button className="btn-ghost" onClick={() => setMode("class")}>
          📎 Adicionar TPC da aula
        </button>
      </div>
    );
  }

  if (mode === "sandra") {
    return (
      <form onSubmit={askSandra} className="card space-y-3 p-4">
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
            {busy ? "A Sandra está a escrever…" : "Pedir ✨"}
          </button>
          <button type="button" className="btn-ghost" onClick={() => setMode(null)}>
            Cancelar
          </button>
        </div>
        {canAssignToFamily ? (
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={forEveryone}
              onChange={(e) => setForEveryone(e.target.checked)}
              className="accent-olive"
            />
            Dar o mesmo TPC a toda a família
          </label>
        ) : null}
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
        💡 Depois de guardar, podes pedir à Sandra para “melhorar” o TPC — ela
        acrescenta vocabulário, um exemplo e exercícios extra.
      </p>
    </form>
  );
}
