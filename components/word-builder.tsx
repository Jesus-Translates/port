"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type WordTile = { id: number; word: string };

/**
 * Build a sentence from word tiles — tap OR drag.
 *
 * Tapping was the only way in, which meant words could only ever be appended:
 * realising the third word belonged first meant removing everything after it.
 * Dragging lets a word go straight to its place, and lets a placed word be
 * moved without dismantling the sentence.
 *
 * Deliberately POINTER events, not HTML5 drag-and-drop. HTML5 `dragstart` does
 * not fire on touch, so a native implementation would be a desktop-only
 * feature in an app that is used on phones. Pointer events give one code path
 * for finger, mouse and stylus.
 *
 * Tap is preserved exactly as it was: a gesture only becomes a drag after
 * moving past a small threshold, so the old muscle memory still works, and
 * the tiles remain real <button>s for keyboard and screen-reader users.
 */
export function WordBuilder({
  tiles,
  placed,
  onChange,
  disabled = false,
  state = "idle",
  placeholder = "Toca ou arrasta as palavras para montar a frase…",
}: {
  tiles: WordTile[];
  /** Tile ids, in the order the learner has placed them. */
  placed: number[];
  onChange: (next: number[]) => void;
  disabled?: boolean;
  /** Colours the tray once the answer has been graded. */
  state?: "idle" | "correct" | "wrong";
  placeholder?: string;
}) {
  const trayRef = useRef<HTMLDivElement | null>(null);
  const slotRefs = useRef<(HTMLElement | null)[]>([]);
  // Set when a pointer gesture turned into a drag, so the click that follows
  // pointerup does not ALSO fire the tap handler.
  const draggedRef = useRef(false);

  const [drag, setDrag] = useState<{
    id: number;
    word: string;
    /** Where the tile came from, so a cancelled drag can put it back. */
    from: "bank" | "tray";
    fromIndex: number;
    x: number;
    y: number;
    dx: number;
    dy: number;
    w: number;
  } | null>(null);
  const [insertAt, setInsertAt] = useState<number | null>(null);

  const wordOf = (id: number) => tiles.find((t) => t.id === id)?.word ?? "";

  /**
   * Which slot the pointer is over.
   *
   * The tray wraps, so this walks the placed tiles in order and takes the
   * first one the pointer is above-or-level-with AND left of the midpoint of.
   * Falling through means "past the end".
   */
  function indexFromPoint(x: number, y: number): number {
    const els = slotRefs.current.filter(Boolean) as HTMLElement[];
    for (let i = 0; i < els.length; i++) {
      const r = els[i].getBoundingClientRect();
      if (y < r.bottom && x < r.left + r.width / 2) return i;
    }
    return els.length;
  }

  function startDrag(
    e: React.PointerEvent,
    id: number,
    from: "bank" | "tray",
    fromIndex: number
  ) {
    if (disabled) return;
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    let live = false;
    draggedRef.current = false;

    const move = (ev: PointerEvent) => {
      if (!live) {
        // A few pixels of slop, so a tap with a shaky thumb stays a tap.
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < 6) return;
        live = true;
        draggedRef.current = true;
        setDrag({
          id,
          word: wordOf(id),
          from,
          fromIndex,
          x: ev.clientX,
          y: ev.clientY,
          dx: startX - r.left,
          dy: startY - r.top,
          w: r.width,
        });
      }
      setDrag((d) => (d ? { ...d, x: ev.clientX, y: ev.clientY } : d));
      setInsertAt(indexFromPoint(ev.clientX, ev.clientY));
    };

    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      if (!live) return; // a tap — the click handler deals with it

      const overTray = (() => {
        const t = trayRef.current?.getBoundingClientRect();
        return t
          ? ev.clientX >= t.left &&
              ev.clientX <= t.right &&
              ev.clientY >= t.top &&
              ev.clientY <= t.bottom
          : false;
      })();

      const target = indexFromPoint(ev.clientX, ev.clientY);
      if (from === "bank") {
        // Dropped outside the tray: no-op rather than a surprise append.
        if (overTray) {
          const next = [...placed];
          next.splice(target, 0, id);
          onChange(next);
        }
      } else {
        const next = placed.filter((_, i) => i !== fromIndex);
        if (overTray) {
          // The removal shifts everything after it left by one.
          next.splice(target > fromIndex ? target - 1 : target, 0, id);
        }
        // Dragged out of the tray entirely = send it back to the bank.
        onChange(next);
      }
      setDrag(null);
      setInsertAt(null);
    };

    const cancel = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      setDrag(null);
      setInsertAt(null);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
  }

  function tapBank(id: number) {
    if (disabled || draggedRef.current || placed.includes(id)) return;
    onChange([...placed, id]);
  }
  function tapTray(at: number) {
    if (disabled || draggedRef.current) return;
    onChange(placed.filter((_, i) => i !== at));
  }

  const graded = state !== "idle";

  return (
    <>
      <div
        ref={trayRef}
        className={cn(
          "flex min-h-24 flex-wrap content-start items-start gap-2 rounded-2xl border-2 border-dashed p-3.5 transition-colors",
          state === "correct"
            ? "border-olive/50 bg-sage-pale/60"
            : state === "wrong"
              ? "border-terra/50 bg-terra-pale/50"
              : "border-sand bg-cream/40"
        )}
      >
        {placed.length === 0 && insertAt === null ? (
          <span className="px-1 py-2 text-sm text-ink-faint">{placeholder}</span>
        ) : null}

        {placed.map((id, i) => (
          <span key={`${id}-${i}`} className="contents">
            {/* The gap a drop would land in. */}
            {insertAt === i && drag ? <DropSlot width={drag.w} /> : null}
            <button
              ref={(el) => {
                slotRefs.current[i] = el;
              }}
              type="button"
              onPointerDown={(e) => startDrag(e, id, "tray", i)}
              onClick={() => tapTray(i)}
              disabled={disabled}
              lang="pt-PT"
              aria-label={`${wordOf(id)} — toca para remover, arrasta para mover`}
              className={cn(
                "min-h-11 touch-none rounded-xl border px-3.5 py-2 font-display text-[17px] transition-all",
                graded
                  ? "border-sand bg-white/70 text-ink"
                  : "border-sage bg-white text-ink shadow-[0_1px_2px_rgba(43,39,31,.06)] active:scale-95",
                drag?.from === "tray" && drag.fromIndex === i && "opacity-30"
              )}
            >
              {wordOf(id)}
            </button>
          </span>
        ))}
        {insertAt !== null && insertAt >= placed.length && drag ? (
          <DropSlot width={drag.w} />
        ) : null}
      </div>

      {/* The bank. Spent tiles stay as invisible holes so the remaining ones
          never shift under a thumb mid-tap. */}
      <div className="mt-3 flex flex-wrap gap-2">
        {tiles.map((t) => {
          const used = placed.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onPointerDown={(e) => (used ? undefined : startDrag(e, t.id, "bank", -1))}
              onClick={() => tapBank(t.id)}
              disabled={used || disabled}
              aria-hidden={used}
              tabIndex={used ? -1 : undefined}
              lang="pt-PT"
              className={cn(
                "min-h-11 touch-none rounded-xl border px-3.5 py-2 font-display text-[17px] transition-all",
                used
                  ? "invisible"
                  : "border-sand bg-white text-ink shadow-[0_2px_0_var(--color-sand)] active:translate-y-0.5 active:shadow-none",
                drag?.from === "bank" && drag.id === t.id && "opacity-30"
              )}
            >
              {t.word}
            </button>
          );
        })}
      </div>

      {/* The tile under the finger. Fixed and pointer-transparent so it never
          becomes its own drop target. */}
      {drag ? (
        <span
          aria-hidden
          lang="pt-PT"
          className="pointer-events-none fixed z-50 rounded-xl border border-sage bg-white px-3.5 py-2 font-display text-[17px] shadow-lg"
          style={{
            left: drag.x - drag.dx,
            top: drag.y - drag.dy,
            // Rotation is the whole "picked up" cue at this size.
            transform: "rotate(-3deg) scale(1.04)",
          }}
        >
          {drag.word}
        </span>
      ) : null}
    </>
  );
}

/** The space that opens where the dragged tile would land. */
function DropSlot({ width }: { width: number }) {
  return (
    <span
      aria-hidden
      className="min-h-11 rounded-xl border-2 border-dashed border-sage/70 bg-sage-pale/50"
      style={{ width: Math.max(28, width) }}
    />
  );
}
