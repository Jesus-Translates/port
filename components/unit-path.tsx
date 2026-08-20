"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Bi } from "@/components/bilingual";
import { completeItem, uncompleteItem } from "@/lib/actions/course";
import { KIND_META, type ItemKind } from "@/lib/course";
import { cn } from "@/lib/utils";

/** One step of the path, already resolved to a real destination by the page. */
export type PathItem = {
  id: number;
  kind: ItemKind;
  titlePt: string;
  href: string;
  hint: string;
  done: boolean;
};

/**
 * The unit's path, as a course rather than a list: every step lands on a real
 * screen that already knows the topic, every step can be ticked off, and the
 * first unfinished one is marked as where you pick up.
 */
/**
 * Kinds with no natural end: you read a phrasebook category or a story until
 * you decide you are done, and nothing in the page can know when that is.
 */
const NEEDS_MANUAL: string[] = ["vocab", "story"];

export function UnitPath({
  items,
  nextUnit,
}: {
  items: PathItem[];
  /** The unit after this one, so 100% is a doorway rather than a dead end. */
  nextUnit?: { slug: string; title: string } | null;
}) {
  // Overrides layer on TOP of the server truth, so a revalidate that brings
  // fresh props back never fights a stale local Set.
  const [overrides, setOverrides] = useState<Record<number, boolean>>({});
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [failed, setFailed] = useState<{ id: number; message: string } | null>(
    null
  );
  const [, startTransition] = useTransition();

  const isDone = (item: PathItem) => overrides[item.id] ?? item.done;

  const total = items.length;
  const done = items.filter(isDone).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const resumeId = items.find((item) => !isDone(item))?.id ?? null;

  function toggle(item: PathItem, next: boolean) {
    if (pendingId !== null) return;
    setPendingId(item.id);
    setFailed(null);
    startTransition(async () => {
      try {
        const res = next
          ? await completeItem(item.id)
          : await uncompleteItem(item.id);
        if (res.ok) {
          setOverrides((prev) => ({ ...prev, [item.id]: next }));
        } else {
          setFailed({ id: item.id, message: res.error });
        }
      } catch {
        setFailed({
          id: item.id,
          message: "Não deu para guardar. Tenta outra vez.",
        });
      } finally {
        setPendingId(null);
      }
    });
  }

  return (
    <section id="caminho" className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">
          O caminho{" "}
          <span className="text-sm font-normal text-ink-faint">
            · work through these in order
          </span>
        </h2>
        <span className="text-xs font-medium text-ink-soft tabular-nums">
          {done}/{total} feitos · {pct}%
        </span>
      </div>

      <div
        className="h-2 overflow-hidden rounded-full bg-sand"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso da unidade"
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            pct === 100 ? "bg-terra" : "bg-olive"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      <ol className="space-y-2">
        {items.map((item, i) => {
          const meta = KIND_META[item.kind];
          const finished = isDone(item);
          const isResume = item.id === resumeId;
          const busy = pendingId === item.id;
          const error = failed?.id === item.id ? failed.message : null;

          return (
            <li
              key={item.id}
              className={cn(
                "card overflow-hidden",
                isResume && "border-sage ring-1 ring-sage-light"
              )}
            >
              <div className="flex items-stretch">
                <span
                  className={cn("w-1.5 shrink-0", isResume ? "bg-olive" : "bg-transparent")}
                  aria-hidden
                />
                <Link
                  href={item.href}
                  className="flex min-w-0 flex-1 items-center gap-3 p-4 transition-colors hover:bg-sage-pale/40"
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full text-lg",
                      finished ? "bg-sage-pale" : "bg-cream"
                    )}
                    aria-hidden
                  >
                    {meta.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "truncate font-medium",
                          finished && "text-ink-soft"
                        )}
                      >
                        {i + 1}. {item.titlePt}
                      </span>
                      {finished ? (
                        <span
                          className="shrink-0 text-olive"
                          title="Feito"
                          aria-label="feito"
                        >
                          ✓
                        </span>
                      ) : null}
                    </span>
                    <span className="block truncate text-xs text-ink-faint">
                      {meta.label}
                      {item.hint ? ` · ${item.hint}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 text-ink-faint" aria-hidden>
                    {isResume ? "›" : "→"}
                  </span>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-sand px-4 py-2">
                {isResume ? (
                  <span className="chip">
                    <Bi pt="Continua aqui" en="Start here" inline />
                  </span>
                ) : null}
                {/*
                 * Activities tick THEMSELVES off now — finishing one and
                 * pressing Continue is the completion. Asking the learner to
                 * also come back here and mark a box is bookkeeping for work
                 * they already did.
                 *
                 * Two exceptions keep the button: reading the phrasebook has
                 * no natural "finished" moment, and undoing a completion has
                 * to stay possible.
                 */}
                {/* Visually 32px keeps this admin row quiet under the real
                    step; tap-44 restores the hit area the target system
                    promises without spending the layout. */}
                {finished ? (
                  <button
                    type="button"
                    className="btn-ghost tap-44 h-8 min-h-0 px-3 text-xs"
                    disabled={pendingId !== null}
                    onClick={() => toggle(item, false)}
                  >
                    {busy ? (
                      <Bi pt="A guardar…" en="Saving…" inline />
                    ) : (
                      <Bi pt="desmarcar" en="unmark" inline />
                    )}
                  </button>
                ) : NEEDS_MANUAL.includes(item.kind) ? (
                  <button
                    type="button"
                    className="btn-ghost tap-44 h-8 min-h-0 px-3 text-xs"
                    disabled={pendingId !== null}
                    onClick={() => toggle(item, true)}
                  >
                    {busy ? (
                      <Bi pt="A guardar…" en="Saving…" inline />
                    ) : (
                      <Bi pt="marcar como feito ✓" en="mark as done" inline />
                    )}
                  </button>
                ) : null}
                {error ? (
                  <span className="text-xs text-terra-dark">{error}</span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {done === total && total > 0 ? (
        <div className="rounded-2xl border-l-4 border-sage bg-sage-pale/60 px-4 py-4">
          <p className="text-sm text-olive">
            🎉 Unidade completa. Boa!{" "}
            <span className="text-olive/80">Every step ticked.</span>
          </p>
          {nextUnit ? (
            <Link
              href={`/unidades/${nextUnit.slug}`}
              className="btn-primary mt-3 block w-full text-center"
            >
              <Bi
                pt={`Próxima unidade: ${nextUnit.title} →`}
                en={`Next unit: ${nextUnit.title}`}
                inline
              />
            </Link>
          ) : (
            <Link href="/unidades" className="btn-ghost mt-3 inline-block">
              <Bi pt="← Ver todas as unidades" en="See all units" inline />
            </Link>
          )}
        </div>
      ) : null}
    </section>
  );
}

/**
 * Builds the path on FIRST REAL VISIT.
 *
 * Fires from a client effect, never during the server render: Next prefetches
 * links on hover, and a prefetch must not spend an AI call.
 */
export function UnitPathBuild({ unitId }: { unitId: number }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const startedRef = useRef(-1);

  useEffect(() => {
    if (startedRef.current === attempt) return;
    startedRef.current = attempt;
    let live = true;
    (async () => {
      try {
        const res = await fetch("/api/ai/unit-path", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ unitId }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error);
        if (live) router.refresh();
      } catch (e) {
        if (!live) return;
        setError(
          e instanceof Error && e.message
            ? e.message
            : "Não deu para montar o caminho."
        );
      }
    })();
    return () => {
      live = false;
    };
  }, [unitId, attempt, router]);

  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-semibold">
        O caminho{" "}
        <span className="text-sm font-normal text-ink-faint">
          · work through these in order
        </span>
      </h2>
      <div className="card p-5">
        {error ? (
          <div className="space-y-3">
            <p className="rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">
              {error}
            </p>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setError(null);
                setAttempt((n) => n + 1);
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
              A Sandra está a montar o caminho…
              <span className="block text-xs text-ink-faint">
                Only happens once — then the whole family gets the same path.
              </span>
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
