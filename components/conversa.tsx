"use client";

import { useEffect, useRef, useState } from "react";
import { AddToDeck } from "@/components/add-to-deck";
import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";

const TOPIC_CHIPS = [
  "a praia",
  "o mercado",
  "o tempo",
  "os vizinhos",
  "a comida",
  "o futebol",
  "a família",
  "as férias",
];

type Msg = {
  role: "luna" | "eu";
  text: string;
  glossEn?: string;
  audioB64?: string | null;
};

type Summary = {
  resumoMd: string;
  corrections: { saidPt: string; betterPt: string; tipEn: string }[];
  newWords: { pt: string; en: string }[];
  encouragementPt: string;
};

function play(b64: string | null | undefined) {
  if (!b64) return;
  new Audio(`data:audio/mpeg;base64,${b64}`).play().catch(() => {});
}

/** Spoken back-and-forth with Luna: she talks, you answer by mic (or keyboard). */
export function Conversa({ cefr }: { cefr: string }) {
  const [phase, setPhase] = useState<"setup" | "talk" | "summary">("setup");
  const [topicInput, setTopicInput] = useState("");
  const [topic, setTopic] = useState("");
  const [voice, setVoice] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typed, setTyped] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);

  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const userTurns = msgs.filter((m) => m.role === "eu").length;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [msgs.length, pending]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recRef.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const historyPayload = () =>
    JSON.stringify(msgs.map((m) => ({ role: m.role, text: m.text })));

  async function start(chosen?: string) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/conversa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "start",
          topic: chosen ?? topicInput ?? "",
          cefr,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTopic(data.topic);
      setVoice(data.voice ?? "");
      setMsgs([
        {
          role: "luna",
          text: data.openerPt,
          glossEn: data.glossEn,
          audioB64: data.audioB64,
        },
      ]);
      setPhase("talk");
      play(data.audioB64);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não deu para começar.");
    } finally {
      setPending(false);
    }
  }

  function applyTurn(data: {
    heard: string;
    replyPt: string;
    glossEn: string;
    audioB64: string | null;
  }) {
    setMsgs((cur) => [
      ...cur,
      { role: "eu", text: data.heard || "🤔 (não percebi)" },
      {
        role: "luna",
        text: data.replyPt,
        glossEn: data.glossEn,
        audioB64: data.audioB64,
      },
    ]);
    play(data.audioB64);
  }

  async function sendTyped() {
    const text = typed.trim();
    if (!text || pending) return;
    setPending(true);
    setError(null);
    setTyped("");
    try {
      const res = await fetch("/api/conversa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "turn",
          typedText: text,
          topic,
          voice,
          cefr,
          history: JSON.parse(historyPayload()),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      applyTurn(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falhou — tenta outra vez.");
      setTyped(text);
    } finally {
      setPending(false);
    }
  }

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        setRecording(false);
        setPending(true);
        const blob = new Blob(chunksRef.current, { type: rec.mimeType });
        const form = new FormData();
        form.append("audio", blob, "audio.webm");
        form.append("topic", topic);
        form.append("voice", voice);
        form.append("cefr", cefr);
        form.append("history", historyPayload());
        try {
          const res = await fetch("/api/conversa", { method: "POST", body: form });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          applyTurn(data);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Falhou — tenta outra vez.");
        } finally {
          setPending(false);
        }
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
      setRecSeconds(0);
      timerRef.current = setInterval(() => {
        setRecSeconds((s) => {
          // Hard cap: nobody's conversation turn needs more than a minute.
          if (s >= 59) recRef.current?.stop();
          return s + 1;
        });
      }, 1000);
    } catch {
      setError("Sem acesso ao microfone — verifica as permissões.");
    }
  }

  async function end() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/conversa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "end",
          topic,
          cefr,
          history: JSON.parse(historyPayload()),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSummary(data);
      setPhase("summary");
    } catch (e) {
      setError(e instanceof Error ? e.message : "O resumo falhou.");
    } finally {
      setPending(false);
    }
  }

  function reset() {
    setPhase("setup");
    setTopicInput("");
    setTopic("");
    setVoice("");
    setMsgs([]);
    setSummary(null);
    setError(null);
  }

  // ── Setup ──────────────────────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <div className="card space-y-4 p-5">
        <div>
          <label className="label" htmlFor="conversa-topic">
            Sobre o que queres falar?
          </label>
          <input
            id="conversa-topic"
            className="input mt-1"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") start();
            }}
            placeholder="ex.: o jantar de domingo…"
            maxLength={200}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {TOPIC_CHIPS.map((t) => (
            <button
              key={t}
              onClick={() => start(t)}
              disabled={pending}
              className="rounded-full border border-sand bg-white/70 px-3 py-1.5 text-sm transition-colors hover:border-sage"
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button className="btn-primary flex-1" onClick={() => start()} disabled={pending}>
            {pending ? "A Luna está a pensar…" : "Começar a conversa 💬"}
          </button>
          <button
            className="btn-ghost"
            onClick={() => start("random")}
            disabled={pending}
            title="Tema à sorte"
          >
            🎲 Surpreende-me
          </button>
        </div>
        {error ? (
          <p className="rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">{error}</p>
        ) : null}
        <p className="text-xs text-ink-faint">
          A Luna fala ao teu nível ({cefr}). Responde com a tua voz — ou escreve,
          se não puderes falar. No fim recebes as correções.
        </p>
      </div>
    );
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  if (phase === "summary" && summary) {
    return (
      <div className="space-y-4">
        <div className="card space-y-3 p-5">
          <h2 className="text-lg font-semibold">📋 Como correu</h2>
          <Markdown className="text-sm">{summary.resumoMd}</Markdown>
          <p className="rounded-xl bg-sage-pale/60 px-3 py-2 text-sm text-olive">
            🌙 {summary.encouragementPt}
          </p>
        </div>

        {summary.corrections.length > 0 ? (
          <div className="card space-y-2 p-5">
            <h3 className="font-semibold">✏️ Diz melhor</h3>
            <p className="text-xs text-ink-faint">
              Estas já foram para o teu baralho de revisão.
            </p>
            {summary.corrections.map((c, i) => (
              <div key={i} className="rounded-xl border border-sand bg-white/70 px-3 py-2 text-sm">
                <span className="text-terra-dark line-through decoration-terra/50">
                  {c.saidPt}
                </span>{" "}
                → <strong className="text-olive">{c.betterPt}</strong>
                <p className="mt-0.5 text-xs text-ink-soft">{c.tipEn}</p>
              </div>
            ))}
          </div>
        ) : null}

        {summary.newWords.length > 0 ? (
          <div className="card space-y-2 p-5">
            <h3 className="font-semibold">🆕 Palavras da conversa</h3>
            <div className="space-y-1.5">
              {summary.newWords.map((w, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="min-w-0 flex-1">
                    <strong>{w.pt}</strong>
                    <span className="text-ink-soft"> — {w.en}</span>
                  </span>
                  <AddToDeck pt={w.pt} en={w.en} compact />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <button className="btn-primary w-full" onClick={reset}>
          Nova conversa 💬
        </button>
      </div>
    );
  }

  // ── Conversation ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <span className="chip">💬 {topic}</span>
        <button
          className="text-xs text-ink-faint underline-offset-2 hover:text-olive hover:underline disabled:opacity-40"
          onClick={end}
          disabled={pending || userTurns < 2}
          title={userTurns < 2 ? "Responde pelo menos duas vezes" : undefined}
        >
          Terminar conversa ✓
        </button>
      </div>

      <div className="space-y-3">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={cn("flex", m.role === "eu" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px]",
                m.role === "eu"
                  ? "rounded-br-sm bg-olive text-paper"
                  : "rounded-bl-sm border border-sand bg-white/80"
              )}
            >
              {m.role === "luna" ? (
                <span className="mr-1" aria-hidden>
                  🌙
                </span>
              ) : null}
              {m.text}
              {m.role === "luna" ? (
                <span className="mt-1.5 flex items-center gap-2">
                  {m.audioB64 ? (
                    <button
                      className="text-xs text-ink-faint hover:text-olive"
                      onClick={() => play(m.audioB64)}
                      title="Ouvir outra vez"
                    >
                      🔊 repetir
                    </button>
                  ) : null}
                  {m.glossEn ? <GlossToggle en={m.glossEn} /> : null}
                </span>
              ) : null}
            </div>
          </div>
        ))}
        {pending ? (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm border border-sand bg-white/80 px-4 py-2.5 text-sm text-ink-faint">
              🌙 …
            </div>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      {error ? (
        <p className="rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">{error}</p>
      ) : null}

      <div className="space-y-2">
        {recording ? (
          <button
            className="btn-terra w-full animate-pulse"
            onClick={() => recRef.current?.stop()}
          >
            ⏹ Parar e enviar ({recSeconds}s)
          </button>
        ) : (
          <button
            className="btn-primary w-full"
            onClick={startRecording}
            disabled={pending}
          >
            {pending ? "A Luna está a ouvir…" : "🎙️ Responder com a voz"}
          </button>
        )}
        <div className="flex gap-2">
          <input
            className="input flex-1"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendTyped();
            }}
            placeholder="…ou escreve aqui"
            maxLength={500}
            disabled={pending || recording}
          />
          <button
            className="btn-ghost"
            onClick={sendTyped}
            disabled={pending || recording || !typed.trim()}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

function GlossToggle({ en }: { en: string }) {
  const [open, setOpen] = useState(false);
  return open ? (
    <span className="text-xs text-ink-soft italic">🇬🇧 {en}</span>
  ) : (
    <button
      className="text-xs text-ink-faint hover:text-olive"
      onClick={() => setOpen(true)}
    >
      🇬🇧 ajuda
    </button>
  );
}
