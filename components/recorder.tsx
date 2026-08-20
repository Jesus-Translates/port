"use client";

import { useEffect, useRef, useState } from "react";
import { Bi } from "@/components/bilingual";
import { Markdown } from "@/components/markdown";
import type { PronResult } from "@/lib/pronunciation";
import { cn } from "@/lib/utils";

type SttResponse = {
  transcript: string;
  pron?: PronResult;
  tips?: string[];
  feedbackMd?: string | null;
  error?: string;
};

function scoreColor(score: number): string {
  if (score >= 85) return "text-olive";
  if (score >= 60) return "text-terra";
  return "text-terra-dark";
}

/** Record → transcribe → pronunciation score (read) or Sandra feedback (open). */
export type RecorderProps = {
  /**
   * "read" scores pronunciation against `target`; "open" sends a free spoken
   * answer to `prompt` to Sandra for feedback.
   */
  mode: "read" | "open";
  /** The sentence to read aloud. Required in "read" mode. */
  target?: string;
  /** The question being answered. Required in "open" mode. */
  prompt?: string;
  /** Open the mic immediately on mount — no second tap. */
  autoStart?: boolean;
};

/** Record → transcribe → pronunciation score (read) or Sandra feedback (open). */
export function Recorder({
  mode,
  target,
  prompt,
  autoStart = false,
}: RecorderProps) {
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const autoStartedRef = useRef(false);
  const [status, setStatus] = useState<
    "idle" | "recording" | "processing" | "done" | "error"
  >("idle");
  const [result, setResult] = useState<SttResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setStatus("processing");
        const blob = new Blob(chunksRef.current, { type: rec.mimeType });
        const form = new FormData();
        form.append("audio", blob, "audio.webm");
        form.append("mode", mode);
        if (target) form.append("target", target);
        if (prompt) form.append("prompt", prompt);
        try {
          const res = await fetch("/api/stt", { method: "POST", body: form });
          const data = (await res.json()) as SttResponse;
          if (!res.ok) throw new Error(data.error);
          setResult(data);
          setStatus("done");
        } catch (e) {
          setErrorMsg(e instanceof Error ? e.message : "Falhou.");
          setStatus("error");
        }
      };
      rec.start();
      recRef.current = rec;
      setStatus("recording");
      setResult(null);
    } catch {
      setErrorMsg("Sem acesso ao microfone — verifica as permissões.");
      setStatus("error");
    }
  }

  function stop() {
    recRef.current?.stop();
  }

  useEffect(() => {
    if (autoStart && !autoStartedRef.current) {
      autoStartedRef.current = true;
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {status === "recording" ? (
          <button className="btn-terra animate-pulse" onClick={stop}>
            <Bi pt="⏹ Parar" en="Stop" inline />
          </button>
        ) : (
          <button
            className="btn-primary"
            onClick={start}
            disabled={status === "processing"}
          >
            {status === "processing" ? (
              <Bi pt="A ouvir-te…" en="Listening…" inline />
            ) : result ? (
              <Bi pt="🎙️ Gravar outra vez" en="Record again" inline />
            ) : (
              <Bi pt="🎙️ Gravar" en="Record" inline />
            )}
          </button>
        )}
        {status === "recording" ? (
          <span className="text-xs text-terra">a gravar… fala!</span>
        ) : null}
      </div>

      {status === "error" && errorMsg ? (
        <p className="rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">
          {errorMsg}
        </p>
      ) : null}

      {result ? (
        <div className="space-y-2">
          {result.pron ? (
            <>
              <div className="flex items-center gap-4 rounded-xl border border-sand bg-white/70 px-4 py-3">
                <div className="text-center">
                  <div
                    className={cn(
                      "font-display text-4xl leading-none font-bold",
                      scoreColor(result.pron.score)
                    )}
                  >
                    {result.pron.score}
                  </div>
                  <div className="text-2xs text-ink-faint">/100 pronúncia</div>
                </div>
                <p className="flex flex-1 flex-wrap gap-x-1.5 gap-y-1 font-display text-lg">
                  {result.pron.words.map((w, i) => (
                    <span
                      key={i}
                      title={
                        w.status === "close"
                          ? `A Sandra ouviu “${w.heard}”`
                          : w.status === "missed"
                            ? "Não ouvido"
                            : undefined
                      }
                      className={cn(
                        "rounded px-0.5",
                        w.status === "ok" && "text-olive",
                        w.status === "close" &&
                          "bg-azul-pale text-azul underline decoration-dotted",
                        w.status === "missed" &&
                          "bg-terra-pale text-terra-dark"
                      )}
                    >
                      {w.word}
                    </span>
                  ))}
                </p>
              </div>
              {result.pron.words.some((w) => w.status === "close") ? (
                <p className="text-xs text-ink-faint">
                  Azul tracejado = quase — toca na palavra para ver o que a Sandra
                  ouviu.
                </p>
              ) : null}
              {result.tips?.length ? (
                <ul className="space-y-1.5">
                  {result.tips.map((t, i) => (
                    <li
                      key={i}
                      className="rounded-xl bg-azul-pale px-3 py-2 text-sm text-azul"
                    >
                      💡 <Markdown className="inline text-[14px]">{t}</Markdown>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="text-2xs text-ink-faint">
                Estimativa a partir do reconhecimento de voz — mede se foste
                percebido, palavra a palavra.
              </p>
            </>
          ) : (
            <div className="rounded-xl border border-sand bg-cream/60 px-3 py-2">
              <div className="text-2xs font-semibold tracking-wide text-ink-faint uppercase">
                O que a Sandra ouviu
              </div>
              <p className="text-[15px]">{result.transcript || "—"}</p>
            </div>
          )}
          {result.feedbackMd ? (
            <div className="flex gap-2 rounded-xl bg-sage-pale/60 px-3 py-2">
              <span aria-hidden>👩‍🏫</span>
              <Markdown className="text-[14px]">{result.feedbackMd}</Markdown>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
