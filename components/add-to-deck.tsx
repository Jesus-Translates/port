"use client";

import { useMemo, useState, useTransition } from "react";
import { addToDeck } from "@/lib/actions/deck";
import { cn } from "@/lib/utils";

/**
 * One-tap "save this to my review deck". Lives anywhere a Portuguese
 * word or phrase is shown — the deck grows from real reading, not admin.
 */
export function AddToDeck({
  pt,
  en,
  note,
  compact = false,
}: {
  pt: string;
  en?: string;
  note?: string;
  compact?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function save() {
    if (saved || pending) return;
    startTransition(async () => {
      try {
        // false = it was already in the deck; either way it's in there now.
        await addToDeck(pt, en, note);
        setSaved(true);
      } catch {
        // Silent — a failed save must never interrupt reading or chatting.
      }
    });
  }

  return (
    <button
      type="button"
      onClick={save}
      disabled={saved || pending}
      title={saved ? `“${pt}” está no baralho` : `Guardar “${pt}” no baralho`}
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-full border transition-colors disabled:cursor-default",
        compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        saved
          ? "border-sage bg-sage-pale text-olive"
          : "border-sand bg-white/70 text-ink-soft hover:border-sage hover:bg-sage-pale hover:text-ink"
      )}
    >
      {/* In a harvest row the chips stand alone, so they carry the word.
          Inline uses sit right next to the phrase already. */}
      {compact ? (
        <span className="max-w-[14rem] truncate font-medium text-ink">{pt}</span>
      ) : null}
      <span className="truncate">
        {saved ? "no baralho ✓" : pending ? "a guardar…" : "+ baralho"}
      </span>
    </button>
  );
}

/**
 * Luna bolds every Portuguese word she teaches, so **bold** is a reliable
 * harvest of "the new vocabulary in this reply". Collapsed by default —
 * the chips are there when you want them, invisible when you don't.
 */
export function HarvestFromMarkdown({ md }: { md: string }) {
  const words = useMemo(() => pickBold(md), [md]);
  const [open, setOpen] = useState(false);

  if (words.length === 0) return null;

  return (
    <div className="mt-2 border-t border-sand/70 pt-1.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-[11px] text-ink-faint transition-colors hover:text-olive"
      >
        Guardar palavras {open ? "▴" : "▾"}
      </button>
      {open ? (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {words.map((w) => (
            <AddToDeck key={w.pt} pt={w.pt} en={w.en} compact />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * All `**bold**` segments: deduped, letters only, short enough to be a card.
 * Luna is instructed to put the English right after the bold in parentheses,
 * so `**o frigorífico** (the fridge)` yields a real en→pt card instead of one
 * with the same text on both sides.
 */
function pickBold(md: string): { pt: string; en: string }[] {
  const out: { pt: string; en: string }[] = [];
  const seen = new Set<string>();
  for (const m of md.matchAll(/\*\*([^*]+)\*\*(?:\s*\(([^)]{1,60})\))?/g)) {
    const pt = m[1].trim();
    if (!pt || pt.length > 60) continue;
    if (!/\p{L}/u.test(pt)) continue;
    const key = pt.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const gloss = (m[2] ?? "").trim();
    out.push({ pt, en: /\p{L}/u.test(gloss) ? gloss : "" });
  }
  return out;
}
