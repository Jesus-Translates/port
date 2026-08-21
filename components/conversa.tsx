"use client";

import { useEffect, useRef, useState } from "react";
import { AddToDeck } from "@/components/add-to-deck";
import { AudioButton } from "@/components/audio-button";
import { Bi } from "@/components/bilingual";
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

const TOPIC_CHIPS: { pt: string; en: string }[] = [
  { pt: "a praia", en: "the beach" },
  { pt: "o mercado", en: "the market" },
  { pt: "o tempo", en: "the weather" },
  { pt: "os vizinhos", en: "the neighbours" },
  { pt: "a comida", en: "the food" },
  { pt: "o futebol", en: "football" },
  { pt: "a família", en: "the family" },
  { pt: "as férias", en: "the holidays" },
];

type Msg = {
  role: "sandra" | "eu";
  text: string;
  glossEn?: string;
  audioB64?: string | null;
};

type Summary = {
  resumoMd: string;
  strengths: { quotePt: string; whyEn: string }[];
  wordChoice: { saidPt: string; naturalPt: string; whyEn: string }[];
  speech: { fluencyEn: string; soundTipEn: string };
  corrections: { saidPt: string; betterPt: string; tipEn: string }[];
  newWords: { pt: string; en: string }[];
  encouragementPt: string;
};

/**
 * Sandra's voice — ONE element for the whole conversation.
 *
 * This is an iOS constraint, not a preference. Safari only lets an audio
 * element play if that element was first started inside a user gesture, and
 * the permission belongs to the ELEMENT, not the page. Building a fresh
 * `new Audio()` per reply therefore worked exactly once — the opener, which
 * follows the "Começar" tap — and every later line was silently blocked,
 * because it arrives after a fetch with no gesture anywhere on the stack.
 *
 * So: one element, unlocked once by unlockVoice() on a real tap, then only
 * ever `src` swaps. It also keeps Sandra from talking over herself, which was
 * the reason the handle was introduced in the first place.
 */
let el: HTMLAudioElement | null = null;

function voiceEl(): HTMLAudioElement {
  if (!el) el = new Audio();
  return el;
}

/**
 * Call from a real user gesture (a tap), before any awaits.
 *
 * Plays the element silently for an instant, which is what grants it
 * permission for the rest of the page's life. Failure is fine and expected on
 * browsers that never needed unlocking.
 */
export function unlockVoice() {
  const a = voiceEl();
  if (a.dataset.unlocked === "1") return;
  a.dataset.unlocked = "1";
  a.muted = true;
  a.play()
    .then(() => {
      a.pause();
      a.currentTime = 0;
      a.muted = false;
    })
    .catch(() => {
      a.muted = false;
    });
}

function play(b64: string | null | undefined) {
  if (!b64) return;
  const a = voiceEl();
  a.pause();
  a.src = `data:audio/mpeg;base64,${b64}`;
  a.currentTime = 0;
  a.play().catch(() => {});
}

export function stopSpeaking() {
  if (!el) return;
  el.pause();
  // removeAttribute, not src = "": assigning an empty string makes Safari
  // resolve it against the page URL and fetch the document as audio.
  el.removeAttribute("src");
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
  /*
   * Sandra's voice, off.
   *
   * Speech is ~86% of what a turn costs, so a written reply is about a seventh
   * of the price and buys roughly seven times as many exchanges from the same
   * allowance. The learner still SPEAKS — only Sandra's half goes quiet — so
   * the practice that matters is untouched. Remembered per browser: someone
   * who studies on a bus wants it off every time, not once.
   */
  const [withVoice, setWithVoice] = useState(true);
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem("conversa:voice") === "off") setWithVoice(false);
    } catch {
      // Private mode: default to voice on.
    }
  }, []);
  function toggleVoice() {
    setWithVoice((on) => {
      try {
        localStorage.setItem("conversa:voice", on ? "off" : "on");
      } catch {}
      if (on) stopSpeaking();
      return !on;
    });
  }
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
    // Synchronously, before any await: iOS only grants playback permission
    // while a gesture is still on the stack.
    unlockVoice();
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
          withVoice,
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
    unlockVoice();
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
          withVoice,
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
    // The reply plays long after this tap, so the unlock has to happen now.
    unlockVoice();
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
        form.append("withVoice", withVoice ? "1" : "0");
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
              key={t.pt}
              onClick={() => start(t.pt)}
              disabled={pending}
              className="min-h-11 rounded-full border border-sand bg-white/70 px-4 py-1.5 text-sm transition-colors hover:border-sage"
            >
              <Bi pt={t.pt} en={t.en} inline />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            className={cn("flex-1", fromUnit ? "btn-ghost" : "btn-primary")}
            onClick={() => start()}
            disabled={pending}
          >
            {pending ? (
              <Bi pt="A Sandra está a pensar…" en="Sandra is thinking…" inline />
            ) : (
              <Bi pt="Começar a conversa 💬" en="Start the conversation" inline />
            )}
          </button>
          <button
            className="btn-ghost"
            onClick={() => start("random")}
            disabled={pending}
            title="Tema à sorte"
          >
            <Bi pt="🎲 Surpreende-me" en="Surprise me" inline />
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
                {pending ? (
                  <Bi pt="A Sandra está a pensar…" en="Sandra is thinking…" inline />
                ) : (
                  <Bi
                    pt={`Falar sobre «${unitTopic.length > 44 ? `${unitTopic.slice(0, 44).trimEnd()}…` : unitTopic}» 💬`}
                    en={`Talk about "${unitTopic.length > 44 ? `${unitTopic.slice(0, 44).trimEnd()}…` : unitTopic}"`}
                    inline
                  />
                )}
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
          <div className="flex items-start gap-2 rounded-xl bg-sage-pale/60 px-3 py-2 text-sm text-olive">
            <p className="flex-1">👩‍🏫 {summary.encouragementPt}</p>
            <AudioButton text={summary.encouragementPt} className="shrink-0" />
          </div>
        </div>

        {/* What went RIGHT, first and quoted. A learner who has just spoken a
            foreign language out loud reads the first panel most carefully, and
            leading with a list of mistakes is how speaking practice becomes
            something people quietly stop doing. */}
        {summary.strengths?.length > 0 ? (
          <div className="card space-y-2 p-5">
            <h3 className="font-semibold">✅ O que correu bem</h3>
            {summary.strengths.map((s2, i) => (
              <div key={i} className="rounded-xl border border-sage/40 bg-sage-pale/40 px-3 py-2 text-sm">
                <div className="flex items-start gap-2">
                  <p className="flex-1 font-display text-base text-olive">
                    “{s2.quotePt}”
                  </p>
                  <AudioButton text={s2.quotePt} className="shrink-0" />
                </div>
                <p className="mt-0.5 text-xs text-ink-soft">{s2.whyEn}</p>
              </div>
            ))}
          </div>
        ) : null}

        {summary.speech?.fluencyEn || summary.speech?.soundTipEn ? (
          <div className="card space-y-2 p-5">
            <h3 className="font-semibold">🎙️ Como falaste</h3>
            {summary.speech.fluencyEn ? (
              <p className="text-sm text-ink-soft">{summary.speech.fluencyEn}</p>
            ) : null}
            {summary.speech.soundTipEn ? (
              <div className="rounded-xl bg-azul-pale/60 px-3 py-2 text-sm text-azul">
                <Markdown className="text-sm">
                  {`🗣️ ${summary.speech.soundTipEn}`}
                </Markdown>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Not mistakes — upgrades. Separated from "Diz melhor" on purpose:
            being told a correct sentence was wrong is discouraging and untrue,
            and this is where most of correct-to-fluent actually lives. */}
        {summary.wordChoice?.length > 0 ? (
          <div className="card space-y-2 p-5">
            <h3 className="font-semibold">💡 Soaria mais natural</h3>
            <p className="text-xs text-ink-faint">
              Não estava errado — é só o que um português diria.
            </p>
            {summary.wordChoice.map((w, i) => (
              <div key={i} className="rounded-xl border border-sand bg-white/70 px-3 py-2 text-sm">
                <div className="flex items-start gap-2">
                  <p className="flex-1">
                    <span className="text-ink-soft">{w.saidPt}</span>{" "}
                    → <strong className="text-olive">{w.naturalPt}</strong>
                  </p>
                  <AudioButton text={w.naturalPt} className="shrink-0" />
                </div>
                <p className="mt-0.5 text-xs text-ink-soft">{w.whyEn}</p>
              </div>
            ))}
          </div>
        ) : null}

        {summary.corrections.length > 0 ? (
          <div className="card space-y-2 p-5">
            <h3 className="font-semibold">✏️ Diz melhor</h3>
            <p className="text-xs text-ink-faint">
              Estas já foram para o teu baralho de revisão.
            </p>
            {summary.corrections.map((c, i) => (
              <div key={i} className="rounded-xl border border-sand bg-white/70 px-3 py-2 text-sm">
                <div className="flex items-start gap-2">
                  <p className="flex-1">
                    <span className="text-terra-dark line-through decoration-terra/50">
                      {c.saidPt}
                    </span>{" "}
                    → <strong className="text-olive">{c.betterPt}</strong>
                  </p>
                  <AudioButton text={c.betterPt} className="shrink-0" />
                </div>
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
                  <AudioButton text={w.pt} className="shrink-0" />
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
              <Bi pt="Nova conversa 💬" en="New conversation" inline />
            </button>
          </div>
        ) : (
          <button className="btn-primary w-full" onClick={reset}>
            <Bi pt="Nova conversa 💬" en="New conversation" inline />
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
        The score, accumulating — and PINNED.

        This screen used to have no end at all: nothing was counted, so nothing
        could be finished, and a course step that opened Sandra could never be
        completed. The bar is the missing feedback — every answer moves it, and
        it is what unlocks the finish.

        It sticks because a conversation grows downwards. Sitting above the
        transcript, it scrolled out of reach after a few exchanges, so the one
        number that says whether you are nearly done was the one thing you had
        to leave the conversation to check. Now it follows you.

        top-0 on phones (no header there) and below the sticky header from sm:
        up, matching what homework-work.tsx already does. Compact on purpose —
        anything pinned to a chat is space taken from the chat, so the finish
        button only appears once it can actually be pressed, and until then the
        same information rides along as "faltam N".
      */}
      <div className="sticky top-0 z-20 -mx-4 border-b border-sand/70 bg-paper/95 px-4 py-2 backdrop-blur sm:top-[4.25rem]">
        <div className="flex items-center gap-3">
          <span className="hidden text-2xs font-semibold tracking-[.09em] text-ink-soft uppercase sm:inline">
            <Bi pt="Pontos" en="Points" inline />
          </span>
          <div className="h-2 min-w-16 flex-1 overflow-hidden rounded-full bg-cream">
            <div
              className="h-2 rounded-full bg-terra transition-[width] duration-500 ease-out"
              style={{ width: `${Math.min(100, (xp / CONVERSA_GOAL) * 100)}%` }}
            />
          </div>
          <span className="font-display text-base font-semibold text-terra tabular-nums">
            {xp}
            <span className="text-2xs font-normal text-ink-faint">
              /{CONVERSA_GOAL}
            </span>
          </span>
          {xp >= CONVERSA_GOAL ? (
            <button
              className="btn-primary shrink-0 px-3 py-1.5 text-sm"
              onClick={end}
              disabled={pending}
            >
              {pending ? (
                <Bi pt="…" en="…" inline />
              ) : (
                <Bi pt="Terminar ✓" en="Finish" inline />
              )}
            </button>
          ) : (
            <span className="shrink-0 text-2xs text-ink-faint tabular-nums">
              <Bi
                pt={`faltam ${CONVERSA_GOAL - xp}`}
                en={`${CONVERSA_GOAL - xp} to go`}
                inline
              />
            </span>
          )}
        </div>
        {/* The reason the number moved, right where the number is. */}
        {gain ? (
          <p className="mt-1 text-xs text-olive">
            +{gain.xp} XP{gain.why ? ` — ${gain.why}` : ""}
          </p>
        ) : null}
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
                      <Bi pt="🔊 repetir" en="replay" inline />
                    </button>
                  ) : (
                    // No pre-fetched clip (voice was off, or this line was
                    // restored from a saved conversation) — fall back to the
                    // on-demand player so the line is never silent.
                    <AudioButton text={m.text} className="min-h-7 min-w-7 px-1.5" />
                  )}
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
            <Bi
              pt={`⏹ Parar e enviar (${recSeconds}s)`}
              en={`Stop and send (${recSeconds}s)`}
              inline
            />
          </button>
        ) : (
          <button
            className="btn-primary w-full"
            onClick={startRecording}
            disabled={pending}
          >
            {pending ? (
              <Bi pt="A Sandra está a ouvir…" en="Sandra is listening…" inline />
            ) : (
              <Bi pt="🎙️ Responder com a voz" en="Answer by voice" inline />
            )}
          </button>
        )}
        {/* The one lever a learner has over their own allowance, stated in
            plain terms rather than as a credits abstraction. */}
        <button
          type="button"
          role="switch"
          aria-checked={!withVoice}
          onClick={toggleVoice}
          className={cn(
            "tap-44 flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-sm transition-colors",
            withVoice
              ? "border-sand bg-white/70 hover:border-sage"
              : "border-olive bg-sage-pale"
          )}
        >
          <span aria-hidden className="text-base">
            {withVoice ? "🔊" : "🔇"}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium">
              {withVoice ? (
                <Bi pt="A Sandra fala" en="Sandra speaks" inline />
              ) : (
                <Bi pt="A Sandra escreve" en="Sandra writes" inline />
              )}
            </span>
            <span className="block text-2xs text-ink-soft">
              {withVoice ? (
                <Bi
                  pt="Toca para desligar a voz — gasta muito menos"
                  en="Tap to turn off voice — uses much less"
                  inline
                />
              ) : (
                <Bi
                  pt="Falas na mesma; ela responde por escrito · ~7x mais conversa"
                  en="You still speak; she replies in writing · ~7x more conversation"
                  inline
                />
              )}
            </span>
          </span>
        </button>

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
            <Bi pt="Enviar" en="Send" inline />
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
      <Bi pt="🇬🇧 ajuda" en="help" inline />
    </button>
  );
}
