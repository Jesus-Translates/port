"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { finishListening } from "@/lib/actions/listening";
import type { ListeningLine } from "@/lib/listening";
import { cn } from "@/lib/utils";

const SPEEDS = [0.75, 0.9, 1] as const;

function clock(t: number): string {
  const s = Number.isFinite(t) && t > 0 ? t : 0;
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
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
}: {
  clipId: number;
  /** Byte count doubles as the audio cache-buster: it changes on re-record. */
  bytes: number;
  lines: ListeningLine[];
  source: string;
}) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState<number>(1);
  const [showTranslation, setShowTranslation] = useState(false);
  const [audioOnly, setAudioOnly] = useState(false);
  const [marked, setMarked] = useState(false);
  const [, startTransition] = useTransition();

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

  function playLine(line: ListeningLine) {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, line.start - 0.06);
    setTime(a.currentTime);
    void a.play();
  }

  function setSpeed(r: number) {
    setRate(r);
    if (audioRef.current) audioRef.current.playbackRate = r;
  }

  function again() {
    setAudioOnly(true);
    seek(0);
    void audioRef.current?.play();
  }

  function mark() {
    if (marked) return;
    setMarked(true);
    startTransition(() => {
      void finishListening(clipId);
    });
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
            {playing ? "⏸ Pausa" : "▶ Ouvir"}
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
            <div className="flex justify-between text-[11px] text-ink-faint">
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
              className="btn-ghost min-h-9 px-3 py-1.5 text-xs"
              onClick={() => setAudioOnly((v) => !v)}
            >
              {audioOnly ? "Mostrar transcrição" : "Modo só áudio"}
            </button>
            <button
              className="btn-ghost min-h-9 px-3 py-1.5 text-xs"
              onClick={() => setShowTranslation((v) => !v)}
              disabled={audioOnly}
            >
              {showTranslation ? "Esconder tradução" : "Mostrar tradução"}
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
          {timed.map((line, i) => {
            const isCurrent = i === current;
            const second = speakers.indexOf(line.speaker) % 2 === 1;
            const words = line.words;
            return (
              <button
                key={i}
                onClick={() => playLine(line)}
                className={cn(
                  "block w-full px-4 py-3 text-left transition-colors",
                  isCurrent ? "bg-sage-pale/70" : "hover:bg-cream/70"
                )}
              >
                <span
                  className={cn(
                    "mb-0.5 block text-[11px] font-semibold tracking-wide uppercase",
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
                      className={cn(
                        "rounded",
                        isCurrent ? "text-terra-dark" : undefined
                      )}
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
            );
          })}
          <p className="px-4 py-2 text-[11px] text-ink-faint">
            Toca numa linha para a ouvir outra vez.
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
            🔁 Outra vez, sem ler
          </button>
          <button className="btn-terra" onClick={mark} disabled={marked}>
            {marked ? "Ouvido ✓" : "Marquei como ouvido ✓"}
          </button>
        </div>
      </section>

      <RecordOwn
        clipId={clipId}
        source={source}
        onReplaced={() => router.refresh()}
      />
    </div>
  );
}

/** Replace the synthetic voices with real ones — the whole point of a family
 *  hub: Kelly's neighbour reading the dialogue beats any neural voice. */
function RecordOwn({
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
      form.append(
        "audio",
        recorded,
        `gravacao.${recorded.type.includes("mp4") ? "mp4" : "webm"}`
      );
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
        className="flex w-full items-center gap-2 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-semibold">🎙️ Gravar a minha versão</span>
        {source === "human" ? (
          <span className="chip bg-terra-pale text-terra-dark">voz real</span>
        ) : null}
        <span className="ml-auto text-xs text-ink-faint">
          {open ? "fechar ▲" : "abrir ▼"}
        </span>
      </button>

      {open ? (
        <div className="mt-3 space-y-3 border-t border-sand/70 pt-3">
          <p className="text-sm text-ink-soft">
            Lê o diálogo em voz alta (podes ser as duas personagens, ou gravar
            com alguém) e substitui as vozes artificiais pela tua.{" "}
            <strong className="font-semibold">
              Fica assim para toda a gente
            </strong>{" "}
            — o texto não muda, só o som, e as marcações de tempo são refeitas a
            partir da tua gravação.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {status === "recording" ? (
              <button className="btn-terra animate-pulse" onClick={stop}>
                ⏹ Parar
              </button>
            ) : (
              <button
                className="btn-primary"
                onClick={start}
                disabled={status === "uploading"}
              >
                {status === "ready" || status === "done"
                  ? "🎙️ Gravar outra vez"
                  : "🎙️ Gravar"}
              </button>
            )}
            {recorded && (status === "ready" || status === "error") ? (
              <button className="btn-ghost" onClick={replace}>
                Substituir áudio
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
