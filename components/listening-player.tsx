"use client";

import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bi } from "@/components/bilingual";
import {
  LessonComplete,
  scoreColor,
  type NextLesson,
} from "@/components/lesson-complete";
import { Markdown } from "@/components/markdown";
import { completeItem } from "@/lib/actions/course";
import { finishListening, myTotalXp } from "@/lib/actions/listening";
import type { ListeningLine } from "@/lib/listening";
import type { PronResult } from "@/lib/pronunciation";
import type { UnitContext } from "@/lib/unit-context";
import { cn } from "@/lib/utils";

const SPEEDS = [0.75, 0.9, 1] as const;

function clock(t: number): string {
  const s = Number.isFinite(t) && t > 0 ? t : 0;
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

/** Container-aware filename extension. Phones record whatever they feel like —
 *  iOS Safari audio/mp4, Chrome audio/webm — and the transcriber rejects a file
 *  whose extension lies about its container. Mirrors `audioExtension` in
 *  lib/listening.ts, kept local so no server module lands in the client bundle. */
function audioExtension(mime: string): string {
  const t = (mime || "").toLowerCase();
  if (t.includes("mp4") || t.includes("m4a")) return "mp4";
  if (t.includes("mpeg") || t.includes("mp3")) return "mp3";
  if (t.includes("ogg")) return "ogg";
  if (t.includes("wav")) return "wav";
  return "webm";
}

/** Last line that has already started — line ends are approximate and the
 *  audio has small pauses between turns, so "started" beats "inside". */
function lineAt(lines: ListeningLine[], t: number): number {
  let hit = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].start <= t + 0.02) hit = i;
    else break;
  }
  return hit;
}

function wordAt(line: ListeningLine, t: number): number {
  if (!line.words) return -1;
  let hit = -1;
  for (let i = 0; i < line.words.length; i++) {
    if (line.words[i].start <= t + 0.02) hit = i;
    else break;
  }
  // Past the end of the line, stop pretending we know where we are.
  if (hit >= 0 && t > line.words[line.words.length - 1].end + 0.5) return -1;
  return hit;
}

export function ListeningPlayer({
  clipId,
  bytes,
  lines,
  source,
  canReplace,
  next,
  unit = null,
}: {
  clipId: number;
  /** Byte count doubles as the audio cache-buster: it changes on re-record. */
  bytes: number;
  lines: ListeningLine[];
  source: string;
  /** Staff only: replacing the library audio changes the clip for everyone. */
  canReplace: boolean;
  next: NextLesson;
  /** Set when a unit path opened this clip, so finishing ticks the step. */
  unit?: UnitContext | null;
}) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState<number>(1);
  const [showTranslation, setShowTranslation] = useState(false);
  const [audioOnly, setAudioOnly] = useState(false);

  const [finished, setFinished] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [xpTotal, setXpTotal] = useState<number | null>(null);
  /** Only true once the unit step really was ticked — never claimed on faith. */
  const [unitTicked, setUnitTicked] = useState(false);
  /** Best-effort last score per line index — a retry replaces the old one. */
  const [scores, setScores] = useState<Record<number, number>>({});
  /** Only one line may hold the microphone: two hot mics on a phone is how you
   *  end up recording a room you forgot about. */
  const [recordingLine, setRecordingLine] = useState<number | null>(null);
  const finishedRef = useRef(false);

  // timeupdate only fires ~4×/s — far too coarse to follow single words, so
  // while it's playing we sample the clock every frame instead.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    function loop() {
      const a = audioRef.current;
      if (a) setTime(a.currentTime);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  // Timings normally come from Whisper and already fit the audio. When the
  // transcriber was unavailable they're a length-weighted estimate in invented
  // seconds — once the real duration is known, stretch them to fit so a tap
  // still lands on the right line.
  const timed = useMemo(() => {
    const last = lines[lines.length - 1]?.end ?? 0;
    if (!duration || last <= 0) return lines;
    const ratio = duration / last;
    if (ratio > 0.8 && ratio < 1.25) return lines;
    return lines.map((l) => ({
      ...l,
      start: l.start * ratio,
      end: l.end * ratio,
      words: l.words
        ? l.words.map((w) => ({
            ...w,
            start: w.start * ratio,
            end: w.end * ratio,
          }))
        : null,
    }));
  }, [lines, duration]);

  const speakers = [...new Set(timed.map((l) => l.speaker))];
  const current = playing || time > 0.05 ? lineAt(timed, time) : -1;
  const activeWord = current >= 0 ? wordAt(timed[current], time) : -1;

  const scored = Object.values(scores);
  const avgScore =
    scored.length === 0
      ? null
      : Math.round(scored.reduce((a, b) => a + b, 0) / scored.length);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) void a.play();
    else a.pause();
  }

  function seek(t: number) {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, t);
    setTime(a.currentTime);
  }

  const playLine = useCallback((line: ListeningLine) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, line.start - 0.06);
    setTime(a.currentTime);
    void a.play();
  }, []);

  function setSpeed(r: number) {
    setRate(r);
    if (audioRef.current) audioRef.current.playbackRate = r;
  }

  function again() {
    setAudioOnly(true);
    seek(0);
    void audioRef.current?.play();
  }

  /** A graded line: keep the score, and if the lesson is already banked, pull
   *  the running total again — /api/stt awards its own XP server-side. */
  const onGraded = useCallback((index: number, score: number) => {
    setScores((s) => ({ ...s, [index]: score }));
    if (finishedRef.current) {
      void myTotalXp()
        .then((t) => {
          // Never replace a total we already have with an unreadable one.
          if (t !== null) setXpTotal(t);
        })
        .catch(() => {});
    }
  }, []);

  /** A line taking or releasing the microphone. */
  const onMicChange = useCallback((index: number, holding: boolean) => {
    setRecordingLine((cur) =>
      holding ? index : cur === index ? null : cur
    );
  }, []);

  async function finish() {
    if (finished || finishing) return;
    setFinishing(true);
    setFinishError(null);
    try {
      const res = await finishListening(clipId);
      setXpEarned(res.xp);
      setXpTotal(res.total);
      finishedRef.current = true;
      setFinished(true);
      // "Marquei como ouvido" IS the completion of the unit step — the learner
      // should never have to walk back to the unit and tick a box by hand. The
      // score is their pronunciation average when they read lines aloud, and
      // null when they only listened; a failure here must not cost them the
      // lesson they just banked.
      if (unit?.itemId) {
        void completeItem(unit.itemId, avgScore)
          .then((r) => {
            if (r.ok) setUnitTicked(true);
          })
          .catch(() => {});
      }
    } catch {
      setFinishError("Não deu para guardar os pontos. Tenta outra vez.");
    } finally {
      setFinishing(false);
    }
  }

  return (
    <div className="space-y-4">
      <audio
        ref={audioRef}
        src={`/api/listening/audio?id=${clipId}&v=${bytes}`}
        preload="metadata"
        onLoadedMetadata={(e) => {
          const a = e.currentTarget;
          a.playbackRate = rate;
          setDuration(Number.isFinite(a.duration) ? a.duration : 0);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
      />

      <section className="card space-y-3 p-4">
        <div className="flex items-center gap-3">
          <button
            className="btn-primary w-24 shrink-0"
            onClick={toggle}
            aria-label={playing ? "Pausa" : "Tocar"}
          >
            {playing ? (
              <Bi pt="⏸ Pausa" en="Pause" inline />
            ) : (
              <Bi pt="▶ Ouvir" en="Play" inline />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.05}
              value={Math.min(time, duration || 0)}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full accent-olive"
              aria-label="Posição no áudio"
            />
            <div className="flex justify-between text-2xs text-ink-faint">
              <span>{clock(time)}</span>
              <span>{clock(duration)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink-faint">Velocidade</span>
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              aria-label={`Velocidade ${s === 1 ? "1×" : `${s}×`}`}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                rate === s
                  ? "border-olive bg-olive text-paper"
                  : "border-sand bg-white/70 hover:border-sage hover:bg-sage-pale"
              )}
            >
              {s === 1 ? "1×" : `${s}×`}
            </button>
          ))}
          <span className="ml-auto flex gap-2">
            <button
              className="btn-ghost min-h-11 px-3 py-1.5 text-xs"
              onClick={() => setAudioOnly((v) => !v)}
            >
              {audioOnly ? (
                <Bi pt="Mostrar transcrição" en="Show transcript" inline />
              ) : (
                <Bi pt="Modo só áudio" en="Audio-only mode" inline />
              )}
            </button>
            <button
              className="btn-ghost min-h-11 px-3 py-1.5 text-xs"
              onClick={() => setShowTranslation((v) => !v)}
              disabled={audioOnly}
            >
              {showTranslation ? (
                <Bi pt="Esconder tradução" en="Hide translation" inline />
              ) : (
                <Bi pt="Mostrar tradução" en="Show translation" inline />
              )}
            </button>
          </span>
        </div>
      </section>

      {audioOnly ? (
        <p className="card p-8 text-center text-sm text-ink-soft">
          Só áudio — ouve sem ler. 👂
          <br />
          <span className="text-xs text-ink-faint">
            Honest listening practice: no text to lean on.
          </span>
        </p>
      ) : (
        <section className="card divide-y divide-sand/60">
          {timed.map((line, i) => (
            <LineRow
              key={i}
              index={i}
              line={line}
              isCurrent={i === current}
              activeWord={i === current ? activeWord : -1}
              second={speakers.indexOf(line.speaker) % 2 === 1}
              showTranslation={showTranslation}
              micBusyElsewhere={recordingLine !== null && recordingLine !== i}
              onPlay={playLine}
              onGraded={onGraded}
              onMicChange={onMicChange}
            />
          ))}
          <p className="px-4 py-2 text-2xs text-ink-faint">
            Toca numa linha para a ouvir outra vez, ou no 🎙️ para a leres em voz
            alta e receberes nota.
          </p>
        </section>
      )}

      <section className="card space-y-3 p-5">
        <h2 className="font-semibold">🤔 Percebeste?</h2>
        <p className="text-sm text-ink-soft">
          Ouve outra vez sem ler. Consegues dizer, por palavras tuas, o que se
          passou — quem falou com quem, e o que ficou combinado?
        </p>
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={again}>
            <Bi pt="🔁 Outra vez, sem ler" en="Again, without reading" inline />
          </button>
        </div>
      </section>

      <LessonComplete
        done={finished}
        pending={finishing}
        error={finishError}
        xpEarned={xpEarned}
        xpTotal={xpTotal}
        recordedLines={scored.length}
        avgScore={avgScore}
        next={next}
        unit={unit}
        unitTicked={unitTicked}
        onFinish={() => void finish()}
      />

      {canReplace ? (
        <ReplaceLibraryAudio
          clipId={clipId}
          source={source}
          onReplaced={() => router.refresh()}
        />
      ) : null}
    </div>
  );
}

type SttRead = {
  transcript: string;
  pron?: PronResult;
  tips?: string[];
  error?: string;
};

/** One transcript line: tap the text to hear it, tap the mic to read it aloud
 *  and be graded on exactly those words. Per line and not per clip on purpose —
 *  90 seconds is far too much to read in one breath, and a short exact target
 *  is what makes the alignment score mean anything.
 *
 *  Memoised: the player re-renders every animation frame while the audio plays,
 *  and only the line being spoken actually has changing props. */
const LineRow = memo(function LineRow({
  index,
  line,
  isCurrent,
  activeWord,
  second,
  showTranslation,
  micBusyElsewhere,
  onPlay,
  onGraded,
  onMicChange,
}: {
  index: number;
  line: ListeningLine;
  isCurrent: boolean;
  activeWord: number;
  second: boolean;
  showTranslation: boolean;
  /** Another line already has the microphone. */
  micBusyElsewhere: boolean;
  onPlay: (line: ListeningLine) => void;
  onGraded: (index: number, score: number) => void;
  onMicChange: (index: number, holding: boolean) => void;
}) {
  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  /** Synchronous re-entrancy latch. `status` is a render behind, so two taps
   *  inside one permission prompt would both open a stream and orphan the
   *  first — a microphone nothing can switch off again. */
  const heldRef = useRef(false);
  const mountedRef = useRef(true);
  const [status, setStatus] = useState<
    "idle" | "starting" | "recording" | "processing" | "done" | "error"
  >("idle");
  const [result, setResult] = useState<SttRead | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Leaving the transcript (or the page) mid-recording must not leave the
  // microphone light on, nor the mic latched for every other line.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (heldRef.current) {
        heldRef.current = false;
        onMicChange(index, false);
      }
    };
  }, [index, onMicChange]);

  async function start() {
    if (heldRef.current) return;
    heldRef.current = true;
    setErrorMsg(null);
    setStatus("starting");
    onMicChange(index, true);
    // Held separately from `streamRef` so the catch can still close a stream
    // that was opened but never made it as far as the recorder.
    let opened: MediaStream | null = null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      opened = stream;
      // The permission prompt outlives the component when you tap "só áudio"
      // while it's open — the granted mic would otherwise stay on forever.
      if (!mountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        // The mic is free the moment the tracks stop — grading takes a while
        // and must not hold every other line hostage.
        onMicChange(index, false);
        setStatus("processing");
        const blob = new Blob(chunksRef.current, { type: rec.mimeType });
        const form = new FormData();
        form.append("audio", blob, `linha.${audioExtension(blob.type)}`);
        form.append("mode", "read");
        form.append("target", line.text);
        try {
          const res = await fetch("/api/stt", { method: "POST", body: form });
          const data = (await res.json()) as SttRead;
          if (!res.ok) throw new Error(data.error);
          setResult(data);
          setStatus("done");
          if (data.pron) onGraded(index, data.pron.score);
        } catch (e) {
          setErrorMsg(
            e instanceof Error && e.message
              ? e.message
              : "Não deu para avaliar. Tenta outra vez."
          );
          setStatus("error");
        } finally {
          heldRef.current = false;
        }
      };
      rec.start();
      recRef.current = rec;
      setStatus("recording");
      setResult(null);
    } catch {
      // Covers both a refused prompt and a MediaRecorder that won't construct;
      // in the second case the stream is already open and must be handed back.
      opened?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      heldRef.current = false;
      onMicChange(index, false);
      setErrorMsg("Sem acesso ao microfone — verifica as permissões.");
      setStatus("error");
    }
  }

  function stop() {
    recRef.current?.stop();
  }

  const words = line.words;
  const starting = status === "starting";
  const busy = status === "processing";
  const micDisabled = starting || busy || micBusyElsewhere;

  return (
    <div
      className={cn(
        "transition-colors",
        isCurrent ? "bg-sage-pale/70" : undefined
      )}
    >
      <div className="flex items-start gap-1 px-2 py-1 sm:px-3">
        <button
          onClick={() => onPlay(line)}
          className="min-w-0 flex-1 rounded-xl px-2 py-2 text-left transition-colors hover:bg-cream/70"
        >
          <span
            className={cn(
              "mb-0.5 block text-2xs font-semibold tracking-wide uppercase",
              second ? "text-azul" : "text-olive"
            )}
          >
            {line.speaker}
          </span>
          <span className="block font-display text-[17px] leading-relaxed">
            {words ? (
              words.map((w, k) => (
                <span
                  key={k}
                  className={cn(
                    "rounded px-0.5",
                    isCurrent && k === activeWord
                      ? "bg-terra-pale text-terra-dark"
                      : undefined
                  )}
                >
                  {w.w}
                  {k < words.length - 1 ? " " : ""}
                </span>
              ))
            ) : (
              <span
                className={cn("rounded", isCurrent ? "text-terra-dark" : undefined)}
              >
                {line.text}
              </span>
            )}
          </span>
          {showTranslation && line.translation ? (
            <span className="mt-1 block text-sm text-ink-faint italic">
              {line.translation}
            </span>
          ) : null}
        </button>

        <button
          onClick={status === "recording" ? stop : () => void start()}
          disabled={micDisabled}
          aria-label={
            status === "recording"
              ? "Parar e avaliar esta linha"
              : micBusyElsewhere
                ? "Outra linha está a ser gravada"
                : "Ler esta linha em voz alta"
          }
          title={
            status === "recording"
              ? "Parar e avaliar"
              : micBusyElsewhere
                ? "Termina a gravação da outra linha primeiro"
                : "Ler esta linha em voz alta"
          }
          className={cn(
            // 44px minimum tap target — this lives next to a much bigger one.
            "mt-1 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border text-base transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            status === "recording"
              ? "animate-pulse border-terra bg-terra text-paper"
              : "border-sand bg-white/70 hover:border-sage hover:bg-sage-pale"
          )}
        >
          {status === "recording" ? "⏹" : starting || busy ? "…" : "🎙️"}
        </button>
      </div>

      {starting ? (
        <p className="px-4 pb-3 text-xs text-ink-faint">A ligar o microfone…</p>
      ) : null}
      {status === "recording" ? (
        <p className="px-4 pb-3 text-xs text-terra">
          A gravar… lê a frase em voz alta e toca em ⏹.
        </p>
      ) : null}
      {busy ? (
        <p className="px-4 pb-3 text-xs text-ink-faint">A avaliar a tua leitura…</p>
      ) : null}
      {errorMsg ? (
        <p className="mx-4 mb-3 rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">
          {errorMsg}
        </p>
      ) : null}

      {result?.pron ? (
        <div className="mx-2 mb-3 space-y-2 rounded-xl border border-sand bg-white/80 p-3 sm:mx-3">
          <div className="flex items-center gap-4">
            <div className="shrink-0 text-center">
              <div
                className={cn(
                  "font-display text-3xl leading-none font-bold",
                  scoreColor(result.pron.score)
                )}
              >
                {result.pron.score}
              </div>
              <div className="text-2xs text-ink-faint">/100 pronúncia</div>
            </div>
            <p className="flex flex-1 flex-wrap gap-x-1.5 gap-y-1 font-display text-base">
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
                    w.status === "missed" && "bg-terra-pale text-terra-dark"
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
        </div>
      ) : null}
    </div>
  );
});

/** Swap the synthetic voices for real ones — the whole point of a family hub:
 *  Kelly's neighbour reading the dialogue beats any neural voice.
 *
 *  Only rendered for staff, because it rewrites the clip for everybody.
 *  /api/listening/human re-checks the role on the request, so this gate is the
 *  affordance and that one is the boundary. */
function ReplaceLibraryAudio({
  clipId,
  source,
  onReplaced,
}: {
  clipId: number;
  source: string;
  onReplaced: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "recording" | "ready" | "uploading" | "done" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recorded, setRecorded] = useState<Blob | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: rec.mimeType });
        setRecorded(blob);
        setPreviewUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return URL.createObjectURL(blob);
        });
        setStatus("ready");
      };
      rec.start();
      recRef.current = rec;
      setStatus("recording");
    } catch {
      setError("Sem acesso ao microfone — verifica as permissões.");
      setStatus("error");
    }
  }

  function stop() {
    recRef.current?.stop();
  }

  async function replace() {
    if (!recorded) return;
    setStatus("uploading");
    setError(null);
    try {
      const form = new FormData();
      form.append("id", String(clipId));
      form.append("audio", recorded, `gravacao.${audioExtension(recorded.type)}`);
      const res = await fetch("/api/listening/human", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error);
      setStatus("done");
      onReplaced();
    } catch (e) {
      setError(
        e instanceof Error && e.message
          ? e.message
          : "Não deu para substituir o áudio."
      );
      setStatus("error");
    }
  }

  return (
    <section className="card p-5">
      <button
        className="flex min-h-11 w-full items-center gap-2 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-semibold">
          <Bi
            pt="🔊 Substituir o áudio da biblioteca"
            en="Replace the library audio"
            inline
          />
        </span>
        {source === "human" ? (
          <span className="chip bg-terra-pale text-terra-dark">
            <Bi pt="voz real" en="real voice" inline />
          </span>
        ) : null}
        <span className="ml-auto text-xs text-ink-faint">
          {open ? (
            <Bi pt="fechar ▲" en="close" inline />
          ) : (
            <Bi pt="abrir ▼" en="open" inline />
          )}
        </span>
      </button>
      <p className="mt-1 text-xs text-ink-faint">
        Isto troca o áudio deste diálogo para toda a família — não é o teu
        exercício de pronúncia.{" "}
        <span className="text-ink-faint/80">
          Staff only. Replaces the clip for everyone, permanently.
        </span>
      </p>

      {open ? (
        <div className="mt-3 space-y-3 border-t border-sand/70 pt-3">
          <p className="text-sm text-ink-soft">
            Lê o diálogo em voz alta (podes ser as duas personagens, ou gravar
            com alguém) e substitui as vozes artificiais pela tua. O texto não
            muda, só o som, e as marcações de tempo são refeitas a partir da tua
            gravação.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {status === "recording" ? (
              <button className="btn-terra animate-pulse" onClick={stop}>
                <Bi pt="⏹ Parar" en="Stop" inline />
              </button>
            ) : (
              <button
                className="btn-primary"
                onClick={() => void start()}
                disabled={status === "uploading"}
              >
                {status === "ready" || status === "done" ? (
                  <Bi pt="🎙️ Gravar outra vez" en="Record again" inline />
                ) : (
                  <Bi pt="🎙️ Gravar" en="Record" inline />
                )}
              </button>
            )}
            {recorded && (status === "ready" || status === "error") ? (
              <button className="btn-ghost" onClick={() => void replace()}>
                <Bi pt="Substituir áudio" en="Replace audio" inline />
              </button>
            ) : null}
            {status === "uploading" ? (
              <span className="text-xs text-ink-faint">
                A guardar e a acertar os tempos…
              </span>
            ) : null}
            {status === "recording" ? (
              <span className="text-xs text-terra">a gravar… lê o diálogo!</span>
            ) : null}
          </div>

          {previewUrl ? (
            <audio src={previewUrl} controls className="w-full" />
          ) : null}

          {status === "done" ? (
            <p className="rounded-xl bg-sage-pale/70 px-3 py-2 text-sm text-olive">
              Trocado! Agora toda a família ouve a tua voz. 🎉
            </p>
          ) : null}
          {error ? (
            <p className="rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
