"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Bi } from "@/components/bilingual";
import { Markdown } from "@/components/markdown";

/*
 * "I have read this unit's note", remembered in this browser.
 *
 * A store rather than an effect because the value exists before React does:
 * reading it in an effect means one render showing the note expanded and a
 * second collapsing it, which is a visible flinch on the exact screen this is
 * meant to stop being tiresome. useSyncExternalStore reads it in the render
 * that needs it, with an honest server snapshot of "unknown, so show it".
 */
const noteKey = (unitId: number) => `ph:note-read:${unitId}`;
const listeners = new Set<() => void>();

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}

function readFlag(unitId: number): boolean {
  try {
    return localStorage.getItem(noteKey(unitId)) === "1";
  } catch {
    // Private mode or storage disabled: the note simply keeps showing.
    return false;
  }
}

function writeFlag(unitId: number) {
  try {
    localStorage.setItem(noteKey(unitId), "1");
  } catch {
    // Not remembering is survivable; refusing to collapse is not.
  }
  listeners.forEach((fn) => fn());
}

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
  hasProgress = false,
}: {
  unitId: number;
  noteMd: string;
  /** True when this learner has already done something in this unit. */
  hasProgress?: boolean;
}) {
  const router = useRouter();
  const [note, setNote] = useState(noteMd);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  /*
   * The note is the right thing to meet FIRST and the wrong thing to meet
   * EVERY time.
   *
   * It sits above the path, so coming back to a unit for one more activity
   * meant scrolling the whole explanation again — good on the first visit,
   * tiresome by the third. So it collapses once it has been read.
   *
   * Two signals, both cheap. The explicit "mark as read" is remembered per
   * unit in this browser, which is where the annoyance lives. And having
   * already DONE something in this unit counts as having read it, so anyone
   * returning after this shipped — or arriving on a second device — is not
   * made to dismiss it again.
   */
  const marked = useSyncExternalStore(
    subscribe,
    () => readFlag(unitId),
    () => false
  );
  const known = marked || hasProgress;

  // Null means "follow `known`"; a boolean is this visit's explicit choice,
  // so re-opening a read note to check something does not un-read it.
  const [override, setOverride] = useState<boolean | null>(null);
  const open = override ?? !known;

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
      <section className="card overflow-hidden">
        <button
          type="button"
          onClick={() => setOverride(!open)}
          aria-expanded={open}
          className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-sage-pale/40"
        >
          <span className="text-xl" aria-hidden>
            📖
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">
              <Bi pt="A nota desta unidade" en="The unit note" inline />
            </span>
            <span className="block text-xs text-ink-faint">
              {known && !open ? (
                <Bi
                  pt="Lida — toca para reler"
                  en="Read — tap to read it again"
                  inline
                />
              ) : (
                <Bi
                  pt="Como funciona, com exemplos"
                  en="How it works, with examples"
                  inline
                />
              )}
            </span>
          </span>
          {known ? (
            <span className="chip bg-sage-pale text-olive">✓</span>
          ) : null}
          <span className="shrink-0 text-ink-faint" aria-hidden>
            {open ? "▴" : "▾"}
          </span>
        </button>

        {open ? (
          <div className="border-t border-sand px-5 pt-4 pb-5">
            <div className="prose-basic">
              <Markdown>{note}</Markdown>
            </div>
            <button
              className="btn-ghost mt-4 w-full"
              onClick={() => {
                writeFlag(unitId);
                setOverride(false);
              }}
            >
              <Bi
                pt="Marcar como lido ✓"
                en="Mark as read — hide this next time"
                inline
              />
            </button>
          </div>
        ) : null}
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
            <Bi pt="Tentar outra vez" en="Try again" inline />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-sm text-ink-soft">
          <span className="animate-pulse text-2xl" aria-hidden>
            👩‍🏫
          </span>
          <span>
            A Sandra está a escrever a nota desta unidade…
            <span className="block text-xs text-ink-faint">
              Só acontece uma vez — depois fica guardada para toda a família.
            </span>
          </span>
        </div>
      )}
    </section>
  );
}
