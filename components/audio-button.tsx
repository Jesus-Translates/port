"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Small play button for pt-PT audio. Pass exactly one of text/entryId/quizId. */
export function AudioButton({
  text,
  entryId,
  quizId,
  className,
  label,
  onEnded,
  autoFocusPlay = false,
}: {
  text?: string;
  entryId?: number;
  quizId?: number;
  className?: string;
  label?: string;
  onEnded?: () => void;
  autoFocusPlay?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "error">(
    "idle"
  );

  const src = entryId
    ? `/api/tts?entry=${entryId}`
    : quizId
      ? `/api/tts?quiz=${quizId}`
      : `/api/tts?text=${encodeURIComponent(text ?? "")}`;

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
          onEnded?.();
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
      {label ? <span className="text-xs font-medium">{label}</span> : null}
    </button>
  );
}
