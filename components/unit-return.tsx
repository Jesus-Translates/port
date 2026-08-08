import Link from "next/link";
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
 * The end-of-activity hand-off. When the step came from a unit, the loudest
 * button should send you back to the course rather than deeper into the tool —
 * previously cloze offered "Outras frases", conversa "Nova conversa", and
 * Escutar the next clip in the library. The unit was the one thing the primary
 * button never mentioned.
 */
export function UnitContinue({ unit }: { unit: UnitContext | null }) {
  if (!unit) return null;
  return (
    <Link
      href={`/unidades/${unit.slug}#caminho`}
      className="btn-primary block w-full text-center"
    >
      Voltar à unidade: {unit.title} →
    </Link>
  );
}
