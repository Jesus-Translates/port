"use client";

import Link from "next/link";
import { UnitContinue } from "@/components/unit-return";
import type { UnitContext } from "@/lib/unit-context";
import { cn } from "@/lib/utils";

/** Where "Continuar →" goes. `null` when this was the last one. */
export type NextLesson = { href: string; title: string; cefr: string } | null;

/** Shared with the per-line grader so one score never reads green next to the
 *  same number in amber on the card below it. */
export function scoreColor(score: number): string {
  if (score >= 85) return "text-olive";
  if (score >= 60) return "text-terra";
  return "text-terra-dark";
}

function Stat({
  value,
  label,
  className,
  tone = "plain",
}: {
  value: string;
  label: string;
  className?: string;
  tone?: "plain" | "highlight";
}) {
  return (
    <div
      className={cn(
        "min-w-[104px] flex-1 rounded-2xl px-4 py-3 text-center",
        tone === "highlight"
          ? "bg-sage-pale"
          : "border border-sand bg-white/70"
      )}
    >
      <div
        className={cn(
          "font-display text-3xl leading-none font-bold tabular-nums",
          className ?? "text-ink"
        )}
      >
        {value}
      </div>
      <div className="mt-1 text-[10px] tracking-wide text-ink-faint uppercase">
        {label}
      </div>
    </div>
  );
}

/**
 * The bottom-of-the-lesson card: bank the points, see what you earned, and go
 * straight to the next one. Kept dumb on purpose — every number is handed in,
 * so any activity can reuse it.
 */
export function LessonComplete({
  done,
  pending,
  error,
  xpEarned,
  xpTotal,
  recordedLines,
  avgScore,
  next,
  onFinish,
  unit = null,
  unitTicked = false,
  backHref = "/escutar",
  backLabel = "Voltar ao Escutar",
}: {
  /** True once the lesson has been logged and the XP is real. */
  done: boolean;
  pending: boolean;
  error: string | null;
  xpEarned: number;
  /** Running total across everything; null until the lesson is logged. */
  xpTotal: number | null;
  recordedLines: number;
  avgScore: number | null;
  next: NextLesson;
  onFinish: () => void;
  /** The unit this lesson is a step of — when set, the course wins the
   *  loudest button and the library's next clip becomes the small option. */
  unit?: UnitContext | null;
  /** True only once the step really was ticked off — never claimed on faith. */
  unitTicked?: boolean;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <section className="card space-y-4 p-5">
      {done ? (
        <>
          <div>
            <h2 className="font-display text-xl font-semibold">
              🎉 Lição concluída
            </h2>
            <p className="mt-0.5 text-sm text-ink-soft">
              Boa! Ficou registado — os pontos já são teus.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Stat
              tone="highlight"
              value={`+${xpEarned}`}
              label="XP nesta lição"
              className="text-olive"
            />
            {xpTotal !== null ? (
              <Stat value={String(xpTotal)} label="XP no total" />
            ) : null}
            {recordedLines > 0 && avgScore !== null ? (
              <Stat
                value={String(avgScore)}
                label={
                  recordedLines === 1
                    ? "média · 1 linha lida"
                    : `média · ${recordedLines} linhas lidas`
                }
                className={scoreColor(avgScore)}
              />
            ) : null}
          </div>

          {recordedLines === 0 ? (
            <p className="text-xs text-ink-faint">
              Ainda não leste nenhuma linha em voz alta — toca no 🎙️ ao lado de
              uma frase para ganhares pontos de pronúncia.{" "}
              <span className="text-ink-faint/80">
                Reading a line aloud earns extra points.
              </span>
            </p>
          ) : null}
        </>
      ) : (
        <>
          <div>
            <h2 className="font-display text-xl font-semibold">
              🏁 Terminar a lição
            </h2>
            <p className="mt-0.5 text-sm text-ink-soft">
              Marca como ouvido para ganhares os teus pontos.{" "}
              <span className="text-ink-faint">
                Mark it done to bank the XP.
              </span>
            </p>
          </div>
          <button
            className="btn-terra w-full sm:w-auto"
            onClick={onFinish}
            disabled={pending}
          >
            {pending ? "A guardar…" : "Marquei como ouvido ✓"}
          </button>
        </>
      )}

      {error ? (
        <p className="rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">
          {error}
        </p>
      ) : null}

      <div className="space-y-2 border-t border-sand/70 pt-4">
        {unit ? (
          // Came from a course path: the unit gets the loud button, and the
          // library's next clip is demoted to "if you feel like more".
          <>
            <UnitContinue unit={unit} />
            {unit.itemId ? (
              <p className="text-[11px] text-ink-faint">
                {unitTicked
                  ? "Este passo ficou marcado na tua unidade. ✓"
                  : "Marca como ouvido em cima e o passo fica feito na unidade."}
              </p>
            ) : null}
            {next ? (
              <Link
                href={next.href}
                className="btn-ghost mt-1 w-full justify-start text-left sm:w-auto"
              >
                <span className="min-w-0 truncate">
                  Mais um diálogo: {next.title} →
                </span>
              </Link>
            ) : null}
          </>
        ) : next ? (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={next.href}
                className={cn(
                  "w-full sm:w-auto",
                  done ? "btn-primary" : "btn-ghost"
                )}
              >
                Continuar →
              </Link>
              <span className="min-w-0 flex-1 text-sm text-ink-soft">
                A seguir:{" "}
                <span className="font-medium text-ink">{next.title}</span>
                <span className="text-ink-faint"> · {next.cefr}</span>
              </span>
            </div>
            <p className="text-[11px] text-ink-faint">
              Next clip in the library — same level where there is one.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-ink-soft">
              Era o último diálogo da biblioteca. Bom trabalho — pede um novo à
              Luna quando quiseres. 👏
            </p>
            <Link
              href={backHref}
              className={cn("w-full sm:w-auto", done ? "btn-primary" : "btn-ghost")}
            >
              {backLabel} →
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
