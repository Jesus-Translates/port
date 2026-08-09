"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { completeAndNext, type NextDestination } from "@/lib/actions/course";
import type { UnitContext } from "@/lib/unit-context";

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

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={go}
        disabled={pending}
        className="btn-primary w-full"
      >
        {pending
          ? "A guardar…"
          : dest?.kind === "unit"
            ? `Próxima unidade: ${dest.title} →`
            : dest?.kind === "done"
              ? "Terminaste! →"
              : "Concluir e seguir →"}
      </button>

      {failed && (
        <p className="text-center text-xs text-terra-dark">
          Não deu para guardar. Tenta outra vez.
        </p>
      )}

      <Link
        href={`/unidades/${slug}#caminho`}
        className="block text-center text-xs text-ink-soft hover:text-olive"
      >
        ou volta à unidade {unit.title}
      </Link>
    </div>
  );
}
