"use client";

import { useEffect, useRef, useState } from "react";
import { AddToDeck } from "@/components/add-to-deck";
import { Markdown } from "@/components/markdown";
import { UnitContinue } from "@/components/unit-return";
import { completeItem } from "@/lib/actions/course";
import {
  finishConversa,
  loadOpenConversa,
  saveTurn,
  startConversa,
} from "@/lib/actions/conversa";
import { CONVERSA_GOAL } from "@/lib/conversa";
import type { UnitContext } from "@/lib/unit-context";
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
  role: "sandra" | "eu";
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

/**
 * Sandra's voice, with a handle on it.
 *
 * This used to be `new Audio(...).play()` — fire and forget, with no reference
 * kept anywhere. Nothing could stop it: leaving the page mid-sentence left her
 * talking over whatever you opened next, and starting a new reply layered a
 * second voice on top of the first. The element is module-level because there
 * is only ever one Sandra, and she should never talk over herself.
 */
let current: HTMLAudioElement | null = null;

function play(b64: string | null | undefined) {
  stopSpeaking();
  if (!b64) return;
  const a = new Audio(`data:audio/mpeg;base64,${b64}`);
  current = a;
  a.play().catch(() => {});
}

export function stopSpeaking() {
  if (!current) return;
  current.pause();
  current.src = "";
  current = null;
}

/** Spoken back-and-forth with Sandra: she talks, you answer by mic (or keyboard). */
export function Conversa({
  cefr,
  initialTopic = "",
  unit = null,
}: {
  cefr: string;
  /** Carried in from a unit path item ("conversa about o talho"). */
  initialTopic?: string;
  /** The course step this conversation is fulfilling, when there is one. */
  unit?: UnitContext | null;
}) {
  const [phase, setPhase] = useState<"setup" | "talk" | "summary">("setup");
  const [topicInput, setTopicInput] = useState(initialTopic);
  const [topic, setTopic] = useState("");
  const [voice, setVoice] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typed, setTyped] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  /** True only once the unit step really was ticked — never claimed on faith. */
  const [unitTicked, setUnitTicked] = useState(false);

  /** The stored row, so the conversation survives leaving the page. */
  const [convId, setConvId] = useState<number | null>(null);
  /** Server-held total. Never incremented locally — it gates course progress. */
  const [xp, setXp] = useState(0);
  /** What the last answer earned, shown briefly so the score is explicable. */
  const [gain, setGain] = useState<{ xp: number; why: string } | null>(null);
  const [restoring, setRestoring] = useState(true);

  /** What this unit asked them to talk about: its item topic, else its name. */
  const unitTopic = (initialTopic || unit?.titlePt || unit?.title || "").trim();

  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [msgs.length, pending]);

  // Leaving mid-sentence must not leave Sandra talking over the next screen.
  useEffect(() => stopSpeaking, []);

  /*
   * Pick the conversation back up.
   *
   * It used to live entirely in React state, so leaving the page threw the
   * whole exchange away — Sandra was the one part of the app with no memory of
   * you, and any XP earned toward finishing the step went with it.
   *
   * Audio is deliberately not restored: it would mean re-synthesizing every
   * line to reopen a page. The text is what you came back for.
   */
  useEffect(() => {
    let live = true;
    loadOpenConversa(unit?.itemId ?? null)
      .then((row) => {
        if (!live || !row) return;
        setConvId(row.id);
        setTopic(row.topic);
        setVoice(row.voice);
        setXp(row.xp);
        setMsgs(
          row.messages.map((m) => ({
            role: m.role,
            text: m.pt,
            glossEn: m.en,
            audioB64: null,
          }))
        );
        if (row.messages.length > 0) setPhase("talk");
      })
      .catch(() => {})
      .finally(() => {
        if (live) setRestoring(false);
      });
    return () => {
      live = false;
    };
    // Once, on mount: reopening mid-conversation must not re-fetch and clobber.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const opener = {
        role: "sandra" as const,
        text: data.openerPt,
        glossEn: data.glossEn,
        audioB64: data.audioB64,
      };
      setMsgs([opener]);
      setXp(0);
      setGain(null);
      setPhase("talk");
      play(data.audioB64);

      // Persist immediately, so a conversation abandoned after one line is
      // still there when they come back rather than starting over.
      const row = await startConversa({
        topic: data.topic,
        voice: data.voice ?? "",
        cefr,
        unitItemId: unit?.itemId ?? null,
        messages: [{ role: "sandra", pt: data.openerPt, en: data.glossEn }],
      }).catch(() => null);
      if (row) setConvId(row.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não deu para começar.");
    } finally {
      setPending(false);
    }
  }

  /**
   * One exchange: the learner's line, Sandra's reply, and what it was worth.
   *
   * Both the spoken and typed paths land here, so persistence and scoring are
   * wired once. The XP shown is whatever the SERVER returns — the client never
   * adds up its own total, because reaching 100 is what unlocks the course
   * step.
   */
  function applyTurn(data: {
    heard: string;
    replyPt: string;
    glossEn: string;
    audioB64: string | null;
    turnXp?: number;
    turnWhyEn?: string;
  }) {
    const mine: Msg = { role: "eu", text: data.heard || "🤔 (não percebi)" };
    const hers: Msg = {
      role: "sandra",
      text: data.replyPt,
      glossEn: data.glossEn,
      audioB64: data.audioB64,
    };
    setMsgs((cur) => {
      const next = [...cur, mine, hers];
      if (convId) {
        void saveTurn({
          id: convId,
          turnXp: data.turnXp ?? 0,
          messages: next.map((m) => ({
            role: m.role,
            pt: m.text,
            en: m.glossEn,
          })),
        })
          .then((r) => setXp(r.xp))
          .catch(() => {});
      }
      return next;
    });
    setGain(
      data.turnXp && data.turnXp > 0
        ? { xp: data.turnXp, why: data.turnWhyEn ?? "" }
        : null
    );
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

      /*
       * Close the row, then tick the step.
       *
       * finishConversa refuses below the goal, so the gate is enforced on the
       * server as well as in the button — the client can be made to click
       * anything, and this unlocks course progress. The score recorded against
       * the item is the XP they actually earned, so the unit bar reflects how
       * the conversation went rather than that it happened.
       */
      if (convId) {
        const done = await finishConversa(convId).catch(() => null);
        if (done?.ok && unit?.itemId) {
          void completeItem(unit.itemId, done.xp)
            .then((r) => {
              if (r.ok) setUnitTicked(true);
            })
            .catch(() => {});
        }
      } else if (unit?.itemId) {
        // No stored row (an older conversation, or the insert failed): fall
        // back to the previous behaviour rather than stranding the step.
        void completeItem(unit.itemId, null)
          .then((r) => {
            if (r.ok) setUnitTicked(true);
          })
          .catch(() => {});
      }
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
    // A new conversation is a new row and a new score — carrying either over
    // would let one finished conversation complete the next step too.
    setConvId(null);
    setXp(0);
    setGain(null);
  }

  // ── Setup ──────────────────────────────────────────────────────────────────
  if (phase === "setup") {
    const fromUnit = Boolean(unit && unitTopic);
    // The free-text box, the eight generic chips and the "surprise me" die.
    // Perfectly good on their own — but when a unit sent you here to talk
    // about o talho, none of them is the thing you came to do.
    const chooseYourOwn = (
      <div className="space-y-4">
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
              className="min-h-11 rounded-full border border-sand bg-white/70 px-4 py-1.5 text-sm transition-colors hover:border-sage"
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            className={cn("flex-1", fromUnit ? "btn-ghost" : "btn-primary")}
            onClick={() => start()}
            disabled={pending}
          >
            {pending ? "A Sandra está a pensar…" : "Começar a conversa 💬"}
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
      </div>
    );

    return (
      <div className="card space-y-4 p-5">
        {fromUnit ? (
          <>
            <div className="space-y-2 rounded-2xl bg-sage-pale/60 p-4">
              <p className="text-2xs font-semibold tracking-wide text-olive uppercase">
                Passo da unidade · {unit?.title}
              </p>
              <p className="font-display text-xl">«{unitTopic}»</p>
              <p className="text-sm text-ink-soft">
                É sobre isto que a Sandra vai falar contigo.{" "}
                <span className="text-ink-faint">
                  Your unit&apos;s own topic — one tap and you&apos;re talking.
                </span>
              </p>
              <button
                className="btn-primary w-full"
                onClick={() => start(unitTopic)}
                disabled={pending}
              >
                {pending
                  ? "A Sandra está a pensar…"
                  : `Falar sobre «${unitTopic.length > 44 ? `${unitTopic.slice(0, 44).trimEnd()}…` : unitTopic}» 💬`}
              </button>
            </div>
            <details className="border-t border-sand/70 pt-3">
              <summary className="flex min-h-11 cursor-pointer items-center text-sm text-ink-soft">
                Preferes outro tema?{" "}
                <span className="ml-1 text-ink-faint">…or pick your own</span>
              </summary>
              <div className="mt-3">{chooseYourOwn}</div>
            </details>
          </>
        ) : (
          chooseYourOwn
        )}
        {error ? (
          <p className="rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">{error}</p>
        ) : null}
        <p className="text-xs text-ink-faint">
          A Sandra fala ao teu nível ({cefr}). Responde com a tua voz — ou escreve,
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
            👩‍🏫 {summary.encouragementPt}
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

        {/* A unit sent them here: the loudest button goes back to the course,
            not deeper into the tool. "Nova conversa" is still one tap away. */}
        {unit ? (
          <div className="space-y-2">
            {unitTicked ? (
              <p className="rounded-xl bg-sage-pale/60 px-3 py-2 text-center text-sm text-olive">
                ✓ Passo concluído na unidade {unit.title}.
              </p>
            ) : null}
            <UnitContinue unit={unit} />
            <button className="btn-ghost w-full" onClick={reset}>
              Nova conversa 💬
            </button>
          </div>
        ) : (
          <button className="btn-primary w-full" onClick={reset}>
            Nova conversa 💬
          </button>
        )}
      </div>
    );
  }

  // ── Conversation ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <span className="chip">💬 {topic}</span>
        <span className="text-2xs text-ink-faint">
          {restoring ? "…" : `${msgs.length} linhas`}
        </span>
      </div>

      {/*
        The score, accumulating.
        This screen used to have no end at all: nothing was counted, so nothing
        could be finished, and a course step that opened Sandra could never be
        completed. The bar is the missing feedback — every answer moves it, and
        it is what unlocks the finish.
      */}
      <div className="card space-y-2 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-2xs font-semibold tracking-[.09em] text-ink-soft uppercase">
            Pontos da conversa
          </span>
          <span className="font-display text-lg font-semibold text-terra tabular-nums">
            {xp}
            <span className="text-xs font-normal text-ink-faint">
              /{CONVERSA_GOAL} XP
            </span>
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-cream">
          <div
            className="h-2 rounded-full bg-terra transition-[width] duration-500 ease-out"
            style={{ width: `${Math.min(100, (xp / CONVERSA_GOAL) * 100)}%` }}
          />
        </div>
        {gain ? (
          <p className="text-xs text-olive">
            +{gain.xp} XP{gain.why ? ` — ${gain.why}` : ""}
          </p>
        ) : (
          <p className="text-xs text-ink-faint">
            {xp >= CONVERSA_GOAL
              ? "Já chega para terminar — fala mais se quiseres."
              : "Frases inteiras valem mais do que “sim”."}
          </p>
        )}
        <button
          className={cn(
            "w-full",
            xp >= CONVERSA_GOAL ? "btn-primary" : "btn-ghost"
          )}
          onClick={end}
          disabled={pending || xp < CONVERSA_GOAL}
          title={
            xp < CONVERSA_GOAL
              ? `Faltam ${CONVERSA_GOAL - xp} XP para terminar`
              : undefined
          }
        >
          {pending
            ? "A Sandra está a pensar…"
            : xp >= CONVERSA_GOAL
              ? "Terminar e ver as correções ✓"
              : `Faltam ${CONVERSA_GOAL - xp} XP`}
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
              {m.role === "sandra" ? (
                <span className="mr-1" aria-hidden>
                  👩‍🏫
                </span>
              ) : null}
              {m.text}
              {m.role === "sandra" ? (
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
              👩‍🏫 …
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
            {pending ? "A Sandra está a ouvir…" : "🎙️ Responder com a voz"}
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
