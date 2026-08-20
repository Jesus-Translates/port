"use client";

import { useEffect, useRef, useState } from "react";
import { Bi } from "@/components/bilingual";
import { cn } from "@/lib/utils";

export type AudioButtonProps = {
  /** Speak this literal Portuguese text. */
  text?: string;
  /** Speak a vocabulary entry's Portuguese; cached server-side by id. */
  entryId?: number;
  /** Speak a quiz question's Portuguese; cached server-side by id. */
  quizId?: number;
  /** Speak a placement dictation item — the sentence stays on the server. */
  placementId?: string;
  className?: string;
  /** Show this text beside the icon instead of an icon-only button. */
  label?: string;
  /** English for `label`, shown in bilingual mode. Omit to leave `label`
   *  exactly as before (used by callers this pass didn't touch). */
  labelEn?: string;
  onEnded?: () => void;
  /** Focus the button on mount, for keyboard-first drills. */
  autoFocusPlay?: boolean;
};

/** Small play button for pt-PT audio. Pass exactly one source prop. */
export function AudioButton({
  text,
  entryId,
  quizId,
  placementId,
  className,
  label,
  labelEn,
  onEnded,
  autoFocusPlay = false,
}: AudioButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "error">(
    "idle"
  );

  const src = entryId
    ? `/api/tts?entry=${entryId}`
    : quizId
      ? `/api/tts?quiz=${quizId}`
      : placementId
        ? `/api/tts?placement=${encodeURIComponent(placementId)}`
        : `/api/tts?text=${encodeURIComponent(text ?? "")}`;

  // The element is built once and reused so a second tap replays from cache
  // instead of re-downloading — which means the `onEnded` captured at that
  // moment would go stale. Read it through a ref so the handler always calls
  // the current prop.
  const onEndedRef = useRef(onEnded);
  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  /*
   * Follow `src` when it changes.
   *
   * Callers keep ONE AudioButton mounted and swap its `text` as the learner
   * advances — the frase game does exactly this. React reuses the instance,
   * so the cached element kept the first sentence's URL and every later
   * question replayed sentence 1. `src` recomputed correctly; nothing ever
   * applied it.
   */
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.src = src;
    a.currentTime = 0;
    setStatus("idle");
  }, [src]);

  /*
   * Stop talking when the button goes away.
   *
   * The element lives on a ref, not in the DOM, so unmounting the component
   * did nothing to it: navigating away mid-sentence left Sandra reading a
   * phrase over whatever screen you opened next, with no way to stop her —
   * the pause control had just been unmounted. Clearing `src` also releases
   * the buffered audio rather than leaving it decoded in memory.
   */
  useEffect(() => {
    return () => {
      const a = audioRef.current;
      if (!a) return;
      a.pause();
      a.src = "";
      audioRef.current = null;
    };
  }, []);

  async function play() {
    if (status === "playing") {
      audioRef.current?.pause();
      setStatus("idle");
      return;
    }
    setStatus("loading");
    try {
      if (!audioRef.current) {
        const a = new Audio(src);
        a.onended = () => {
          setStatus("idle");
          onEndedRef.current?.();
        };
        a.onerror = () => setStatus("error");
        audioRef.current = a;
      }
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      setStatus("playing");
    } catch {
      setStatus("error");
    }
  }

  return (
    <button
      type="button"
      onClick={play}
      autoFocus={autoFocusPlay}
      title={status === "error" ? "Áudio indisponível" : "Ouvir"}
      /* A title names a control only for sighted mouse users; the app's
         most-used button needs a real accessible name. When a visible label
         is passed, that text already names the button — don't override it. */
      aria-label={
        label
          ? undefined
          : status === "error"
            ? "Áudio indisponível"
            : status === "playing"
              ? "Pausar"
              : "Ouvir"
      }
      className={cn(
        "tap-44 inline-flex min-h-9 min-w-9 items-center justify-center gap-1.5 rounded-full border border-sand bg-white/70 px-2.5 text-sm transition-colors hover:border-sage hover:bg-sage-pale",
        status === "playing" && "border-olive bg-sage-pale",
        status === "error" && "opacity-40",
        className
      )}
    >
      <span aria-hidden>
        {status === "loading" ? "…" : status === "playing" ? "⏸" : "🔊"}
      </span>
      {label ? (
        <span className="text-xs font-medium">
          {labelEn ? <Bi pt={label} en={labelEn} inline /> : label}
        </span>
      ) : null}
    </button>
  );
}
