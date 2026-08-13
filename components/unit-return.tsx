"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  completeAndNext,
  peekNextStep,
  type NextDestination,
} from "@/lib/actions/course";
import type { UnitContext } from "@/lib/unit-context";
import { cn } from "@/lib/utils";

/**
 * "You are here because of this unit" — shown at the top of any activity
 * opened from a course path, so the learner always knows where they are and
 * can always get back. Renders nothing when they arrived some other way.
 */
export function UnitReturn({ unit }: { unit: UnitContext | null }) {
  if (!unit) return null;
  return (
    <Link
      href={`/unidades/${unit.slug}#caminho`}
      className="flex min-h-11 items-center gap-2 text-xs text-ink-faint transition-colors hover:text-olive"
    >
      <span aria-hidden>←</span>
      <span>
        <span className="text-ink-soft">voltar à unidade</span>{" "}
        <span className="font-medium">{unit.title}</span>
      </span>
    </Link>
  );
}

/**
 * The end-of-activity hand-off: finish this, go straight to the next thing.
 *
 * It used to send the learner back to the unit page to choose their next step
 * from a list — a decision at the exact moment they had momentum, and the
 * reason a "lesson" never felt like it flowed into the next one. Now one tap
 * ticks the item off and lands on the next step, then the next unit, and only
 * at the very end says you are finished.
 *
 * Returning to the unit is still there, quietly, for anyone who wants the map.
 */
export function UnitContinue({
  unit,
  score,
}: {
  unit: UnitContext | null;
  /** Optional 0-100, recorded against the item when there is one. */
  score?: number | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [dest, setDest] = useState<NextDestination | null>(null);
  const [failed, setFailed] = useState(false);

  const itemId = unit?.itemId ?? null;
  const slug = unit?.slug ?? "";

  /*
   * Name the next session before the button is pressed.
   *
   * A lesson that ends on "Concluir e seguir →" still ends on a mystery: you
   * are agreeing to something unnamed. Naming it — "A seguir: 6 palavras para
   * rever · 2 min" — is the difference between finishing a lesson and starting
   * the next one, which is the whole reason this redesign exists.
   */
  const [ahead, setAhead] = useState<NextDestination | null>(null);
  useEffect(() => {
    if (!itemId) return;
    let live = true;
    peekNextStep(itemId)
      .then((d) => {
        if (live) setAhead(d);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [itemId]);

  if (!unit) return null;

  // No item id means this activity was not opened as a path step; the honest
  // thing is a plain way back rather than a Continue that completes nothing.
  if (!unit.itemId) {
    return (
      <Link
        href={`/unidades/${unit.slug}#caminho`}
        className="btn-primary block w-full text-center"
      >
        Voltar à unidade: {unit.title} →
      </Link>
    );
  }

  function go() {
    setFailed(false);
    start(async () => {
      try {
        const next = await completeAndNext(itemId!, score ?? null);
        setDest(next);
        router.push(next.href);
        router.refresh();
      } catch {
        setFailed(true);
      }
    });
  }

  const shown = dest ?? ahead;
  const title =
    shown?.kind === "step"
      ? shown.label
      : shown?.kind === "unit"
        ? shown.title
        : shown?.kind === "done"
          ? "Terminaste o teu nível"
          : null;
  const meta =
    shown?.kind === "step"
      ? `${minutesFor(shown.label)} · passo ${shown.index} de ${shown.total}`
      : shown?.kind === "unit"
        ? "Nova unidade · desbloqueada"
        : shown?.kind === "done"
          ? "Não há mais passos por agora"
          : null;

  return (
    <div className="space-y-2">
      {/*
        The hand-off. Olive, pinned at the end of the lesson, naming what comes
        next and how long it takes — then one button that starts it. A lesson
        that ends on a list is a lesson nobody follows with another.
      */}
      <div className="rounded-[20px] bg-olive p-[18px_18px_16px] text-paper">
        <p className="text-[10.5px] font-semibold tracking-[.14em] text-paper/85 uppercase">
          A seguir
        </p>
        <p className="mt-1 font-display text-[21px] leading-tight font-semibold">
          {title ?? "Concluir esta lição"}
        </p>
        {meta ? (
          <p className="mt-1 text-[13px] text-paper/85">{meta}</p>
        ) : null}

        <button
          type="button"
          onClick={go}
          disabled={pending}
          className={cn(
            "mt-3.5 flex min-h-12 w-full items-center justify-center rounded-[14px] bg-paper",
            "text-[15px] font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
          )}
        >
          {pending ? "A guardar…" : "Continuar →"}
        </button>
      </div>

      {failed && (
        <p className="text-center text-xs text-terra-dark">
          Não deu para guardar. Tenta outra vez.
        </p>
      )}

      {/* The quiet way out. Deliberately low-contrast: stopping is always
          allowed, but it should not compete with continuing. */}
      <Link
        href={`/unidades/${slug}#caminho`}
        className="flex min-h-11 items-center justify-center text-center text-[13.5px] text-ink-faint hover:text-olive"
      >
        Parar por hoje
      </Link>
    </div>
  );
}

/**
 * A rough minute estimate from the step's own name.
 *
 * No activity records its expected length, and inventing a per-kind table
 * would be a lie with more decimal places. These are the honest brackets: a
 * game is short, a conversation is not.
 */
function minutesFor(label: string): string {
  const l = label.toLowerCase();
  if (/(jogo|pares|intruso|género|genero|frase)/.test(l)) return "2 min";
  if (/(conversa|falar|sandra)/.test(l)) return "8 min";
  if (/(hist|escuta|ouvir|diálogo|dialogo)/.test(l)) return "6 min";
  if (/(tpc|trabalho)/.test(l)) return "10 min";
  return "5 min";
}
