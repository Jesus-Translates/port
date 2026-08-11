import Link from "next/link";
import { IconCheck } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * The calçada portuguesa — the course as a mosaic pavement, not a list.
 *
 * A list of lessons asks "which one?" every single time. A path answers it:
 * there is exactly one lit stone and it is the next thing to do. The stones
 * are rotated squares with a flat 3px shadow so they read as laid paving
 * rather than floating cards, and the current one pulses so the eye lands on
 * it without an arrow or a "start here" label.
 *
 * LAYOUT HAZARD, found in design review and easy to reintroduce: the
 * horizontal offsets live on the INNER stone column and the INNER cobble row,
 * never on the full-width flex row. A translateX on a 362px row pushes its
 * right edge to 460px inside a 402px viewport and the whole screen scrolls
 * sideways. The rows are plain centred flex; only their contents shift.
 */

export type Stone = {
  slug: string;
  /** Short caption under the stone — the unit's pt-PT name. */
  label: string;
  state: "done" | "current" | "ahead";
};

/** The weave. Alternating left/right so the trail reads as a path, not a line. */
const OFFSETS = [-92, -46, 14, 48, 78, 30, -24, -62, -96];

export function CalcadaPath({
  stones,
  unitLabel,
}: {
  stones: Stone[];
  /** "Unidade 3 · Na rua" — where this stretch of path sits. */
  unitLabel?: string | null;
}) {
  if (stones.length === 0) {
    return (
      <p className="card p-6 text-center text-sm text-ink-soft">
        O teu caminho ainda não foi traçado.
      </p>
    );
  }

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="label mb-0">O teu caminho</p>
        {unitLabel ? (
          <span className="text-[11.5px] text-ink-faint">{unitLabel}</span>
        ) : null}
      </div>

      {/*
        overflow-x-clip is the second half of the hazard fix: even with the
        offsets on the inner elements, a wide caption on an outer stone can
        still reach past the edge. Clip rather than scroll — a sideways-
        scrolling column is never what anyone wanted.
      */}
      <div className="column-phone overflow-x-clip py-1">
        {stones.map((stone, i) => {
          const offset = OFFSETS[i % OFFSETS.length];
          const trailOffset = OFFSETS[(i + 1) % OFFSETS.length];
          return (
            <div key={stone.slug}>
              <div className="flex justify-center">
                <div
                  className="flex flex-col items-center"
                  style={{ transform: `translateX(${offset}px)` }}
                >
                  <StoneTile stone={stone} />
                </div>
              </div>
              {i < stones.length - 1 ? (
                <Trail
                  offset={(offset + trailOffset) / 2}
                  lit={stone.state === "done"}
                  extraTop={stone.state === "current"}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StoneTile({ stone }: { stone: Stone }) {
  if (stone.state === "current") {
    return (
      <>
        <Link
          href={`/unidades/${stone.slug}#caminho`}
          aria-label={`Continuar: ${stone.label}`}
          className="animate-ph-pulse grid size-[78px] rotate-45 place-items-center rounded-[22px] bg-terra shadow-[0_4px_0_var(--color-terra-dark)] transition-transform active:translate-y-0.5 active:shadow-[0_2px_0_var(--color-terra-dark)]"
        >
          <span className="-rotate-45 px-2 text-center font-display text-[15px] leading-tight font-semibold text-paper">
            {shortLabel(stone.label)}
          </span>
        </Link>
        <span className="mt-1.5 text-center text-xs font-semibold text-terra-dark">
          {stone.label} · agora
        </span>
      </>
    );
  }

  if (stone.state === "done") {
    return (
      <>
        <Link
          href={`/unidades/${stone.slug}#caminho`}
          aria-label={`Revisitar: ${stone.label}`}
          className="grid size-[62px] rotate-45 place-items-center rounded-[18px] bg-olive shadow-[0_3px_0_var(--color-olive-deep)] transition-transform active:translate-y-0.5 active:shadow-[0_1px_0_var(--color-olive-deep)]"
        >
          <IconCheck size={24} strokeWidth={2.8} className="-rotate-45 text-paper" />
        </Link>
        <span className="mt-1 text-center text-[11.5px] font-semibold text-ink-soft">
          {stone.label}
        </span>
      </>
    );
  }

  /*
   * Units ahead: quieter, but OPEN.
   *
   * These used to be padlocks — a non-link with a lock icon. The path is a
   * picture of where you are, not a gate: someone who wants to read ahead, or
   * skip a topic they already know, should be able to. Nothing on the server
   * ever enforced the lock anyway, so the padlock only stopped the people
   * honest enough to believe it.
   */
  return (
    <>
      <Link
        href={`/unidades/${stone.slug}#caminho`}
        aria-label={`Ver: ${stone.label}`}
        className="grid size-[62px] rotate-45 place-items-center rounded-[18px] border-[1.5px] border-sand bg-cream transition-colors hover:border-sage hover:bg-sage-pale active:translate-y-0.5"
      >
        <span className="-rotate-45 px-1.5 text-center font-display text-[12.5px] leading-tight font-semibold text-ink-faint">
          {shortLabel(stone.label)}
        </span>
      </Link>
      <span className="mt-1 text-center text-[11.5px] text-ink-faint">
        {stone.label}
      </span>
    </>
  );
}

/** Three small cobbles between stones. The offset is on THIS row, not the parent. */
function Trail({
  offset,
  lit,
  extraTop,
}: {
  offset: number;
  lit: boolean;
  extraTop: boolean;
}) {
  return (
    <div className={cn("flex justify-center", extraTop ? "pt-3.5 pb-3" : "py-3")}>
      <div
        className="flex gap-2.5"
        style={{ transform: `translateX(${offset}px)` }}
        aria-hidden
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "size-[7px] rotate-45",
              lit ? "bg-sand" : "bg-cream"
            )}
          />
        ))}
      </div>
    </div>
  );
}

/** Two words at most: the stone is 78px across and the text is counter-rotated. */
function shortLabel(label: string): string {
  const words = label.split(/\s+/);
  return words.length <= 2 ? label : words.slice(0, 2).join(" ");
}
