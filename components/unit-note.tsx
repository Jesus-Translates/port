"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Markdown } from "@/components/markdown";

/**
 * Renders a unit's Learning Note, writing it on first open.
 *
 * The generation fires from a client effect rather than during the server
 * render on purpose: Next prefetches links on hover, and prefetching a unit
 * must not spend an AI call. Effects only run for a real visit.
 */
export function UnitNote({
  unitId,
  noteMd,
}: {
  unitId: number;
  noteMd: string;
}) {
  const router = useRouter();
  const [note, setNote] = useState(noteMd);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (note.trim() || startedRef.current) return;
    startedRef.current = true;
    (async () => {
      try {
        const res = await fetch("/api/ai/unit-note", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ unitId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setNote(data.noteMd);
        // Pull the stored copy into the server tree so a reload is instant.
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Não deu para escrever a nota.");
      }
    })();
  }, [unitId, note, router]);

  if (note.trim()) {
    return (
      <section className="card prose-basic p-5">
        <Markdown>{note}</Markdown>
      </section>
    );
  }

  return (
    <section className="card p-5">
      {error ? (
        <div className="space-y-3">
          <p className="rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">
            {error}
          </p>
          <button
            className="btn-ghost"
            onClick={() => {
              startedRef.current = false;
              setError(null);
              setNote("");
            }}
          >
            Tentar outra vez
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-sm text-ink-soft">
          <span className="animate-pulse text-2xl" aria-hidden>
            🌙
          </span>
          <span>
            A Luna está a escrever a nota desta unidade…
            <span className="block text-xs text-ink-faint">
              Só acontece uma vez — depois fica guardada para toda a família.
            </span>
          </span>
        </div>
      )}
    </section>
  );
}
