"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ErrorPattern } from "@/lib/actions/admin";
import { titleCase } from "@/lib/people";
import { formatDate } from "@/lib/utils";

/**
 * The point of the per-learner page: what this person actually keeps getting
 * wrong, pulled out of the graded homework and quiz JSON, plus a one-tap way
 * to turn any of it into the next assignment.
 *
 * The topic is pre-filled from the chosen weak point but stays editable —
 * Kelly usually wants to narrow it ("o imperfeito, só no passado da praia").
 */
export function ErrorPatterns({
  username,
  patterns,
}: {
  username: string;
  patterns: ErrorPattern[];
}) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  function choose(p: ErrorPattern) {
    setOpenId((id) => (id === p.id ? null : p.id));
    setTopic(p.topic);
    setError(null);
    setDone(null);
  }

  async function assign() {
    const t = topic.trim();
    if (!t) return;
    setBusy(true);
    setError(null);
    try {
      // Same endpoint the teacher panel uses: it re-checks the session, only
      // lets staff target another learner, and pitches the exercises at that
      // learner's own placement level.
      const res = await fetch("/api/ai/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t, assignees: [username] }),
      });
      if (!res.ok) {
        // The route has a real message for the rate limit — show it rather
        // than a generic failure the teacher can't act on.
        const body = await res.json().catch(() => null);
        throw new Error(
          typeof body?.error === "string" ? body.error : "Não deu para atribuir."
        );
      }
      setDone(`TPC sobre “${t}” atribuído a ${titleCase(username)} ✓`);
      setOpenId(null);
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error && e.message
          ? e.message
          : "Não deu para atribuir. Tenta outra vez."
      );
    } finally {
      setBusy(false);
    }
  }

  if (patterns.length === 0) {
    return (
      <p className="card p-5 text-sm text-ink-soft">
        Ainda não há correções suficientes para ver um padrão. Assim que{" "}
        {titleCase(username)} entregar TPC ou fizer testes, os erros que se
        repetem aparecem aqui.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {done ? (
        <p className="rounded-xl bg-sage-pale px-3 py-2 text-sm text-olive">
          {done}
        </p>
      ) : null}

      {patterns.map((p) => {
        const open = openId === p.id;
        return (
          <div key={p.id} className="card overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 px-4 py-3">
              <span className="min-w-0 flex-1 font-medium">{p.label}</span>
              <span
                className={
                  p.count >= 3
                    ? "chip shrink-0 bg-terra-pale text-terra-dark"
                    : "chip shrink-0"
                }
              >
                {p.count}×
              </span>
              <span className="shrink-0 text-xs text-ink-faint">
                {formatDate(p.lastAt)}
              </span>
            </div>

            <ul className="space-y-2 border-t border-sand/70 px-4 py-3">
              {p.examples.map((e, i) => (
                <li key={`${e.source}-${e.ref}-${i}`} className="text-sm">
                  {e.corrected ? (
                    <p className="text-ink">
                      <span className="text-ink-faint">✓ </span>
                      {e.corrected}
                    </p>
                  ) : null}
                  {e.tip ? (
                    <p className="mt-0.5 text-[13px] text-azul">💡 {e.tip}</p>
                  ) : null}
                  <p className="mt-0.5 text-xs text-ink-faint">
                    {e.source === "tpc" ? "TPC" : "Teste"}: {e.title}
                  </p>
                </li>
              ))}
            </ul>

            <div className="border-t border-sand/70 px-4 py-3">
              <button
                type="button"
                className="btn-ghost w-full sm:w-auto"
                onClick={() => choose(p)}
                aria-expanded={open}
              >
                ✍️ Atribuir TPC sobre isto
              </button>

              {open ? (
                <div className="mt-3 space-y-2">
                  <label className="label" htmlFor={`topic-${p.id}`}>
                    Tema do TPC
                  </label>
                  <input
                    id={`topic-${p.id}`}
                    className="input"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={busy}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn-terra"
                      onClick={assign}
                      disabled={busy || !topic.trim()}
                    >
                      {busy
                        ? "A Sandra está a escrever…"
                        : `Atribuir a ${titleCase(username)}`}
                    </button>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => setOpenId(null)}
                      disabled={busy}
                    >
                      Cancelar
                    </button>
                  </div>
                  {error ? (
                    <p className="rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">
                      {error}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
