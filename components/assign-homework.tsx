"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { assignHomework } from "@/lib/actions/admin";
import { avatarFor } from "@/lib/people";
import { cn } from "@/lib/utils";

/** Teacher panel: pick students, then either let Luna write the homework or
 *  write it yourself. */
export function AssignHomework({ students }: { students: string[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<"luna" | "manual">("luna");
  const [topic, setTopic] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  function toggle(u: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(u)) next.delete(u);
      else next.add(u);
      return next;
    });
    setDone(null);
  }

  async function assignWithLuna() {
    if (selected.size === 0 || !topic.trim()) return;
    setBusy(true);
    setDone(null);
    try {
      const res = await fetch("/api/ai/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          assignees: [...selected],
        }),
      });
      if (!res.ok) throw new Error();
      setDone(`TPC da Luna atribuído a ${selected.size} ${selected.size === 1 ? "aluno" : "alunos"} ✓`);
      setTopic("");
      router.refresh();
    } catch {
      setDone("Falhou — tenta outra vez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card space-y-4 p-5">
      <div>
        <span className="label">Alunos</span>
        <div className="flex flex-wrap gap-2">
          {students.map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => toggle(u)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm capitalize transition-colors",
                selected.has(u)
                  ? "border-olive bg-olive text-paper"
                  : "border-sand bg-white/70 hover:border-sage"
              )}
            >
              {avatarFor(u)} {u}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setSelected(new Set(students));
              setDone(null);
            }}
            className="rounded-full border border-sand bg-white/70 px-3 py-1.5 text-xs text-ink-soft hover:border-sage"
          >
            todos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-xl border border-sand bg-white/60 p-1">
        {(
          [
            { key: "luna", label: "✨ A Luna escreve" },
            { key: "manual", label: "✍️ Escrevo eu" },
          ] as const
        ).map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              mode === m.key
                ? "bg-olive text-paper"
                : "text-ink-soft hover:bg-sage-pale"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === "luna" ? (
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-48 flex-1">
            <label className="label" htmlFor="assign-topic">
              Tema
            </label>
            <input
              id="assign-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="input"
              placeholder="ex.: o pretérito imperfeito no dia a dia"
            />
          </div>
          <button
            className="btn-terra"
            disabled={busy || selected.size === 0 || !topic.trim()}
            onClick={assignWithLuna}
          >
            {busy ? "A Luna está a escrever…" : `Atribuir a ${selected.size || "…"}`}
          </button>
        </div>
      ) : (
        <form
          action={async (fd) => {
            [...selected].forEach((u) => fd.append("assignees", u));
            await assignHomework(fd);
            setDone(`TPC atribuído a ${selected.size} ${selected.size === 1 ? "aluno" : "alunos"} ✓`);
            router.refresh();
          }}
          className="space-y-3"
        >
          <div>
            <label className="label" htmlFor="assign-title">
              Título
            </label>
            <input id="assign-title" name="title" className="input" required />
          </div>
          <div>
            <label className="label" htmlFor="assign-instr">
              O TPC (markdown; lista numerada = perguntas individuais)
            </label>
            <textarea
              id="assign-instr"
              name="instructions"
              rows={6}
              className="input resize-y"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={selected.size === 0}
          >
            Atribuir a {selected.size || "…"}
          </button>
        </form>
      )}

      {done ? (
        <p className="rounded-xl bg-sage-pale px-3 py-2 text-sm text-olive">
          {done}
        </p>
      ) : null}
    </div>
  );
}
