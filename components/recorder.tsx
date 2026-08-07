"use client";

import { useRef, useState } from "react";
import { Markdown } from "@/components/markdown";
import type { DitadoResult } from "@/lib/ditado";
import { cn } from "@/lib/utils";

type SttResponse = {
  transcript: string;
  diff?: DitadoResult;
  feedbackMd?: string | null;
  error?: string;
};

/** Record → transcribe → show what was understood. */
export function Recorder({
  mode,
  target,
  prompt,
}: {
  mode: "read" | "open";
  target?: string;
  prompt?: string;
}) {
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
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

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {status === "recording" ? (
          <button className="btn-terra animate-pulse" onClick={stop}>
            ⏹ Parar
          </button>
        ) : (
          <button
            className="btn-primary"
            onClick={start}
            disabled={status === "processing"}
          >
            {status === "processing"
              ? "A ouvir-te…"
              : result
                ? "🎙️ Gravar outra vez"
                : "🎙️ Gravar"}
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
          {result.diff ? (
            <>
              <p className="flex flex-wrap gap-x-1.5 gap-y-1 font-display text-lg">
                {result.diff.words.map((w, i) => (
                  <span
                    key={i}
                    className={cn(
                      "rounded px-0.5",
                      w.ok ? "text-olive" : "bg-terra-pale text-terra-dark"
                    )}
                  >
                    {w.word}
                  </span>
                ))}
              </p>
              <p className="text-xs text-ink-faint">
                Verde = a Luna percebeu esta palavra. Isto mede se foste
                entendido — não é uma nota de pronúncia.
              </p>
            </>
          ) : (
            <div className="rounded-xl border border-sand bg-cream/60 px-3 py-2">
              <div className="text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                O que a Luna ouviu
              </div>
              <p className="text-[15px]">{result.transcript || "—"}</p>
            </div>
          )}
          {result.feedbackMd ? (
            <div className="flex gap-2 rounded-xl bg-sage-pale/60 px-3 py-2">
              <span aria-hidden>🌙</span>
              <Markdown className="text-[14px]">{result.feedbackMd}</Markdown>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
