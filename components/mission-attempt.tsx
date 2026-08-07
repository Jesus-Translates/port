"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";

type AttemptResult = {
  score: number;
  transcript: string;
  feedbackMd: string | null;
  correctedPt: string | null;
  error?: string;
};

function scoreColor(score: number): string {
  if (score >= 7) return "text-olive";
  if (score >= 4) return "text-terra";
  return "text-terra-dark";
}

/** Two ways to close a mission: record yourself doing (or rehearsing) it and
 *  let Luna grade it, or just tell us it's done. */
export function MissionAttempt({
  missionId,
  selfReport,
}: {
  missionId: number;
  selfReport: (id: number, note: string) => Promise<void>;
}) {
  const router = useRouter();
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [status, setStatus] = useState<
    "idle" | "recording" | "processing" | "done" | "error"
  >("idle");
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [note, setNote] = useState("");
  const [reported, setReported] = useState(false);
  const [pending, startTransition] = useTransition();

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
        form.append("id", String(missionId));
        try {
          const res = await fetch("/api/missions/attempt", {
            method: "POST",
            body: form,
          });
          const data = (await res.json()) as AttemptResult;
          if (!res.ok) throw new Error(data.error);
          setResult(data);
          setStatus("done");
          router.refresh();
        } catch (e) {
          setErrorMsg(e instanceof Error ? e.message : "Falhou.");
          setStatus("error");
        }
      };
      rec.start();
      recRef.current = rec;
      setStatus("recording");
      setResult(null);
      setErrorMsg(null);
    } catch {
      setErrorMsg("Sem acesso ao microfone — verifica as permissões.");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-4">
      <section className="card space-y-3 p-5">
        <div>
          <h2 className="font-display text-lg font-semibold">
            🎙️ Grava a missão
          </h2>
          <p className="text-sm text-ink-soft">
            Record yourself doing it for real, or rehearsing it at home. Luna
            listens and grades the errand out of 10.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {status === "recording" ? (
            <button
              className="btn-terra animate-pulse"
              onClick={() => recRef.current?.stop()}
            >
              ⏹ Parar
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={start}
              disabled={status === "processing"}
            >
              {status === "processing"
                ? "A Luna está a ouvir…"
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
            <div className="flex items-center gap-4 rounded-xl border border-sand bg-white/70 px-4 py-3">
              <div className="text-center">
                <div
                  className={cn(
                    "font-display text-4xl leading-none font-bold",
                    scoreColor(result.score)
                  )}
                >
                  {result.score}
                </div>
                <div className="text-[10px] text-ink-faint">/10 missão</div>
              </div>
              <p className="flex-1 text-sm text-ink-soft">
                {result.score >= 7
                  ? "Missão cumprida — isto funcionava mesmo na rua. 🎉"
                  : "Quase! Treina outra vez e volta a gravar."}
              </p>
            </div>

            <div className="rounded-xl border border-sand bg-cream/60 px-3 py-2">
              <div className="text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                O que a Luna ouviu
              </div>
              <p className="text-[15px]">{result.transcript || "—"}</p>
            </div>

            {result.feedbackMd ? (
              <div className="flex gap-2 rounded-xl bg-sage-pale/60 px-3 py-2">
                <span aria-hidden>🌙</span>
                <Markdown className="text-[14px]">{result.feedbackMd}</Markdown>
              </div>
            ) : null}

            {result.correctedPt ? (
              <div className="rounded-xl bg-azul-pale px-3 py-2 text-sm text-azul">
                <span className="font-semibold">Diz assim: </span>
                <span className="font-display text-[16px]">
                  {result.correctedPt}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="card space-y-3 p-5">
        <div>
          <h2 className="font-display text-lg font-semibold">
            ✅ Fiz a missão!
          </h2>
          <p className="text-sm text-ink-soft">
            No recording? Just mark it done — 15 XP and it goes on the board.
          </p>
        </div>
        <div>
          <label className="label" htmlFor="mission-note">
            Como correu? (opcional)
          </label>
          <textarea
            id="mission-note"
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setReported(false);
            }}
            rows={3}
            maxLength={2000}
            className="input"
            placeholder="ex.: percebi tudo menos o troco — a senhora falou muito rápido!"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            className="btn-terra"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await selfReport(missionId, note);
                setNote("");
                setReported(true);
                router.refresh();
              })
            }
          >
            {pending ? "A guardar…" : "✅ Fiz a missão!"}
          </button>
          {reported ? (
            <span className="text-sm text-olive">Boa! +15 XP 🎉</span>
          ) : null}
        </div>
      </section>
    </div>
  );
}
