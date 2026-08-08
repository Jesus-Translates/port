"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AudioButton } from "@/components/audio-button";
import { Markdown } from "@/components/markdown";
import { finishVerbRound } from "@/lib/actions/verbos";
import type { PronResult } from "@/lib/pronunciation";
import {
  checkSpelling,
  choiceOptions,
  type Regularity,
  selectForms,
  type Slot,
  slotPrompt,
  speakTarget,
  TENSES,
  type VerbClass,
  type VerbFilters,
} from "@/lib/verb-filter";
import { cn } from "@/lib/utils";
import { TENSE_LABEL, type Tense } from "@/lib/verbs";

const ROUND = 10;
/** Speaking is slow (record → upload → score), so keep it a spice, not the meal. */
const SPEAK_PER_ROUND = 3;

type QType = "escrever" | "escolher" | "dizer";
type Verdict = "certo" | "quase" | "errado";
type Question = { slot: Slot; type: QType; options: string[] };
type Outcome = { question: Question; verdict: Verdict };

const TYPE_META: Record<QType, { emoji: string; title: string; sub: string }> = {
  escrever: { emoji: "✏️", title: "Escrever", sub: "escreves a forma" },
  escolher: { emoji: "🔤", title: "Escolher", sub: "quatro hipóteses" },
  dizer: { emoji: "🎙️", title: "Dizer", sub: "dizes em voz alta" },
};

const CLASS_CHOICES: { key: VerbClass | "all"; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "ar", label: "-ar" },
  { key: "er", label: "-er" },
  { key: "ir", label: "-ir" },
];

const REGULARITY_CHOICES: { key: Regularity; label: string; sub: string }[] = [
  { key: "all", label: "Todos", sub: "regular + irregular" },
  { key: "regular", label: "Regulares", sub: "seguem o padrão" },
  { key: "irregular", label: "Irregulares", sub: "os que fogem" },
];

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * How many questions a round will hold. Speaking-only rounds are shorter —
 * ten recordings in a row is a chore, not practice.
 */
function roundSize(poolSize: number, types: QType[]): number {
  const speakOnly = types.length === 1 && types[0] === "dizer";
  return Math.min(speakOnly ? 5 : ROUND, poolSize);
}

/** Deal a round over the chosen slice, mixing the question types asked for. */
function buildRound(filters: VerbFilters, types: QType[]): Question[] {
  const speakOnly = types.length === 1 && types[0] === "dizer";
  const slots = selectForms(filters, {
    shuffle: true,
    limit: speakOnly ? 5 : ROUND,
  });
  if (slots.length === 0 || types.length === 0) return [];

  const others = types.filter((t) => t !== "dizer");
  const speaking = !types.includes("dizer")
    ? 0
    : others.length === 0
      ? slots.length
      : Math.min(SPEAK_PER_ROUND, Math.max(1, Math.round(slots.length / 4)));

  const sequence = shuffle(
    slots.map((_, i) =>
      i < speaking ? "dizer" : others[(i - speaking) % others.length]
    )
  );
  return slots.map((slot, i) => ({
    slot,
    type: sequence[i],
    options: sequence[i] === "escolher" ? choiceOptions(slot) : [],
  }));
}

export function VerbTest({ initialTense }: { initialTense?: Tense }) {
  // ── setup ──
  const [cls, setCls] = useState<VerbClass | "all">("all");
  const [tenses, setTenses] = useState<Tense[]>(
    initialTense ? [initialTense] : ["presente", "perfeito"]
  );
  const [regularity, setRegularity] = useState<Regularity>("all");
  const [types, setTypes] = useState<QType[]>(["escrever", "escolher", "dizer"]);

  // ── round ──
  const [round, setRound] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── the question in front of you ──
  const [typed, setTyped] = useState("");
  const [chosen, setChosen] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [mic, setMic] = useState<
    "idle" | "recording" | "sending" | "done" | "error"
  >("idle");
  const [pron, setPron] = useState<PronResult | null>(null);
  const [tips, setTips] = useState<string[]>([]);
  const [micError, setMicError] = useState<string | null>(null);

  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Leaving mid-recording must close the microphone — a live mic on a phone
  // that has navigated away is not acceptable, and the upload is moot anyway.
  useEffect(() => {
    return () => {
      const rec = recRef.current;
      if (rec && rec.state !== "inactive") {
        rec.onstop = null;
        rec.stop();
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const filters: VerbFilters = {
    classes: cls === "all" ? ["ar", "er", "ir", "outro"] : [cls],
    tenses,
    regularity,
  };
  const question = round?.[index];
  const score = outcomes.filter((o) => o.verdict !== "errado").length;

  function toggleTense(t: Tense) {
    setTenses((cur) =>
      cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]
    );
  }

  function toggleType(t: QType) {
    setTypes((cur) =>
      cur.includes(t)
        ? cur.length > 1
          ? cur.filter((x) => x !== t)
          : cur // never leave the round with nothing to ask
        : [...cur, t]
    );
  }

  function resetQuestion() {
    setTyped("");
    setChosen(null);
    setVerdict(null);
    setNote(null);
    setMic("idle");
    setPron(null);
    setTips([]);
    setMicError(null);
  }

  function start() {
    const next = buildRound(filters, types);
    if (next.length === 0) return;
    setRound(next);
    setIndex(0);
    setOutcomes([]);
    setDone(false);
    setSaveError(null);
    resetQuestion();
  }

  function settle(v: Verdict, why?: string) {
    if (!question) return;
    setVerdict(v);
    setNote(why ?? null);
    setOutcomes((cur) => [...cur, { question, verdict: v }]);
  }

  function checkTyped() {
    if (!question || !typed.trim()) return;
    const { verdict: v, note: why } = checkSpelling(typed, question.slot.answer);
    settle(v, v === "quase" ? why : undefined);
  }

  function pick(option: string) {
    if (!question || verdict !== null) return;
    setChosen(option);
    settle(option === question.slot.answer ? "certo" : "errado");
  }

  async function next() {
    if (!round) return;
    if (index < round.length - 1) {
      setIndex((i) => i + 1);
      resetQuestion();
      return;
    }
    setDone(true);
    setSaving(true);
    setSaveError(null);
    try {
      await finishVerbRound(
        score,
        round.length,
        outcomes
          .filter((o) => o.verdict === "errado")
          .map((o) => ({
            prompt: slotPrompt(o.question.slot),
            answer: o.question.slot.answer,
          }))
      );
    } catch {
      setSaveError("Ganhaste os pontos, mas não deu para guardar a ronda.");
    } finally {
      setSaving(false);
    }
  }

  /* ── speaking ─────────────────────────────────────────────────────────── */

  async function startRecording() {
    if (!question) return;
    const target = speakTarget(question.slot);
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      streamRef.current = stream;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setMic("sending");
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        // iOS Safari records audio/mp4, Chrome audio/webm — the filename
        // extension has to match the real container or the transcriber balks.
        const ext = blob.type.includes("mp4")
          ? "mp4"
          : blob.type.includes("ogg")
            ? "ogg"
            : "webm";
        const body = new FormData();
        body.append("audio", blob, `audio.${ext}`);
        body.append("mode", "read");
        body.append("target", target.sentence);
        try {
          const res = await fetch("/api/stt", { method: "POST", body });
          const data = (await res.json()) as {
            pron?: PronResult;
            tips?: string[];
            error?: string;
          };
          if (!res.ok || !data.pron) {
            throw new Error(data.error || "Não deu para avaliar a gravação.");
          }
          setPron(data.pron);
          setTips(data.tips ?? []);
          setMic("done");
          // Graded on the conjugated form itself, not on the whole sentence.
          const status = data.pron.words[target.wordIndex]?.status ?? "missed";
          settle(
            status === "ok" ? "certo" : status === "close" ? "quase" : "errado",
            status === "close"
              ? `a Luna ouviu «${data.pron.words[target.wordIndex]?.heard ?? "?"}»`
              : undefined
          );
        } catch (e) {
          setMicError(
            e instanceof Error && e.message
              ? e.message
              : "Não deu para avaliar a gravação."
          );
          setMic("error");
        }
      };
      recorder.start();
      recRef.current = recorder;
      setMic("recording");
    } catch {
      setMicError("Sem acesso ao microfone — verifica as permissões.");
      setMic("error");
    }
  }

  function stopRecording() {
    recRef.current?.stop();
  }

  function skipSpeaking() {
    settle("errado");
    setMic("done");
  }

  /* ── setup screen ─────────────────────────────────────────────────────── */

  if (!round || done) {
    const misses = outcomes.filter((o) => o.verdict === "errado");
    // Only the setup screen needs the count, so it is not paid for mid-round.
    const poolSize = selectForms(filters).length;
    return (
      <div className="space-y-4">
        {done && round ? (
          <div className="card space-y-4 p-6">
            <div className="text-center">
              <div className="mb-1 text-4xl" aria-hidden>
                {score >= round.length - 1 ? "🏆" : score >= round.length / 2 ? "💪" : "🌱"}
              </div>
              <p className="font-display text-3xl font-semibold">
                {score}/{round.length}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                {saving
                  ? "A guardar…"
                  : misses.length === 0
                    ? "Conjugação impecável!"
                    : "Os erros foram para o teu baralho de revisão."}
              </p>
              {saveError ? (
                <p className="mt-2 rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">
                  {saveError}
                </p>
              ) : null}
            </div>

            {misses.length > 0 ? (
              <ul className="divide-y divide-sand/60 rounded-xl border border-sand bg-white/60">
                {misses.map((m, i) => (
                  <li key={i} className="flex items-center gap-3 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs text-ink-faint">
                        {slotPrompt(m.question.slot)}
                      </div>
                      <div className="font-display text-lg">
                        {m.question.slot.answer}
                      </div>
                    </div>
                    <AudioButton text={m.question.slot.answer} />
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="space-y-2">
              <Link href="/practice" className="btn-primary block w-full">
                Continuar →
              </Link>
              <div className="flex flex-wrap justify-center gap-2">
                <button className="btn-ghost" onClick={start} disabled={saving}>
                  Outra ronda ↻
                </button>
                <Link href="/verbos" className="btn-ghost">
                  📖 Consultar tabelas
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        <div className="card space-y-5 p-5">
          <div>
            <span className="label">Classe do verbo</span>
            <div className="flex flex-wrap gap-1.5">
              {CLASS_CHOICES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCls(c.key)}
                  aria-pressed={cls === c.key}
                  className={cn(
                    "min-h-11 rounded-full border px-4 py-1.5 text-sm transition-colors",
                    cls === c.key
                      ? "border-olive bg-olive text-paper"
                      : "border-sand bg-white/70 hover:border-sage hover:bg-sage-pale"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="label">Tempos verbais</span>
            <div className="flex flex-wrap gap-1.5">
              {TENSES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTense(t)}
                  aria-pressed={tenses.includes(t)}
                  className={cn(
                    "min-h-11 rounded-full border px-3 py-1.5 text-sm transition-colors",
                    tenses.includes(t)
                      ? "border-olive bg-olive text-paper"
                      : "border-sand bg-white/70 hover:border-sage hover:bg-sage-pale"
                  )}
                >
                  {TENSE_LABEL[t]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="label">Regularidade</span>
            <div className="grid grid-cols-3 gap-1.5">
              {REGULARITY_CHOICES.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRegularity(r.key)}
                  aria-pressed={regularity === r.key}
                  className={cn(
                    "min-h-11 rounded-xl border px-2 py-2 transition-colors",
                    regularity === r.key
                      ? "border-olive bg-olive text-paper"
                      : "border-sand bg-white/70 hover:border-sage hover:bg-sage-pale"
                  )}
                >
                  <div className="text-sm font-semibold">{r.label}</div>
                  <div
                    className={cn(
                      "text-[10px]",
                      regularity === r.key ? "text-paper/80" : "text-ink-faint"
                    )}
                  >
                    {r.sub}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="label">Tipos de pergunta</span>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(TYPE_META) as QType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleType(t)}
                  aria-pressed={types.includes(t)}
                  className={cn(
                    "min-h-11 rounded-xl border px-2 py-2 transition-colors",
                    types.includes(t)
                      ? "border-olive bg-olive text-paper"
                      : "border-sand bg-white/70 hover:border-sage hover:bg-sage-pale"
                  )}
                >
                  <div className="text-sm font-semibold">
                    <span aria-hidden>{TYPE_META[t].emoji}</span>{" "}
                    {TYPE_META[t].title}
                  </div>
                  <div
                    className={cn(
                      "text-[10px]",
                      types.includes(t) ? "text-paper/80" : "text-ink-faint"
                    )}
                  >
                    {TYPE_META[t].sub}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-ink-soft">
              {poolSize} formas nesta seleção.{" "}
              <span className="text-ink-faint">
                Forms matching your filters — a round takes{" "}
                {roundSize(poolSize, types)} of them.
              </span>
            </p>
            {poolSize === 0 ? (
              <p className="rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">
                Nada com estes filtros — escolhe outro tempo ou outra classe.
              </p>
            ) : null}
            <button
              className="btn-terra w-full"
              onClick={start}
              disabled={poolSize === 0 || tenses.length === 0}
            >
              {done ? "Outra ronda →" : "Começar a treinar →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── playing ──────────────────────────────────────────────────────────── */

  if (!question) return null;
  const q = question;
  const target = speakTarget(q.slot);
  const meta = TYPE_META[q.type];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5">
        {round.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i < index
                ? outcomes[i]?.verdict === "errado"
                  ? "bg-terra"
                  : outcomes[i]?.verdict === "quase"
                    ? "bg-azul"
                    : "bg-olive"
                : i === index
                  ? "bg-azul"
                  : "bg-sand"
            )}
          />
        ))}
      </div>

      <div className="card space-y-4 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
            {index + 1} de {round.length} · {q.slot.en}
          </p>
          <span className="chip">
            <span aria-hidden>{meta.emoji}</span> {meta.title}
          </span>
        </div>

        <p className="font-display text-2xl leading-snug">
          {slotPrompt(q.slot)}
        </p>

        {q.type === "escrever" ? (
          <input
            // Remount per question so autoFocus fires again — otherwise only
            // the first typed question opens the keyboard on a phone.
            key={index}
            aria-label={`Forma de ${q.slot.inf}`}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (verdict === null) checkTyped();
                else void next();
              }
            }}
            disabled={verdict !== null}
            className="input"
            placeholder="Escreve a forma…"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
          />
        ) : null}

        {q.type === "escolher" ? (
          <div className="grid gap-2">
            {q.options.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => pick(o)}
                disabled={verdict !== null}
                className={cn(
                  "min-h-11 rounded-xl border px-4 py-2.5 text-left font-display text-lg transition-colors",
                  verdict === null
                    ? "border-sand bg-white/70 hover:border-sage hover:bg-sage-pale"
                    : o === q.slot.answer
                      ? "border-olive bg-sage-pale text-olive"
                      : o === chosen
                        ? "border-terra bg-terra-pale text-terra-dark"
                        : "border-sand bg-white/40 text-ink-faint"
                )}
              >
                {o}
              </button>
            ))}
          </div>
        ) : null}

        {q.type === "dizer" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-sand bg-cream/60 px-3 py-2.5">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                  Diz esta frase
                </div>
                <p className="font-display text-lg break-words">
                  {target.sentence}
                </p>
              </div>
              <AudioButton text={target.sentence} />
            </div>

            {mic === "recording" ? (
              <button className="btn-terra w-full animate-pulse" onClick={stopRecording}>
                ⏹ Parar
              </button>
            ) : verdict === null ? (
              <button
                className="btn-primary w-full"
                onClick={startRecording}
                disabled={mic === "sending"}
              >
                {mic === "sending"
                  ? "A Luna está a ouvir-te…"
                  : mic === "error"
                    ? "🎙️ Gravar outra vez"
                    : "🎙️ Gravar"}
              </button>
            ) : null}

            {micError ? (
              <div className="space-y-2">
                <p className="rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">
                  {micError}
                </p>
                {verdict === null ? (
                  <button className="btn-ghost w-full" onClick={skipSpeaking}>
                    Saltar esta (conta como falhada)
                  </button>
                ) : null}
              </div>
            ) : null}

            {pron ? (
              <div className="space-y-2">
                <div className="flex items-center gap-4 rounded-xl border border-sand bg-white/70 px-4 py-3">
                  <div className="text-center">
                    <div
                      className={cn(
                        "font-display text-3xl leading-none font-bold",
                        pron.score >= 85
                          ? "text-olive"
                          : pron.score >= 60
                            ? "text-terra"
                            : "text-terra-dark"
                      )}
                    >
                      {pron.score}
                    </div>
                    <div className="text-[10px] text-ink-faint">/100 frase</div>
                  </div>
                  <p className="flex flex-1 flex-wrap gap-x-1.5 gap-y-1 font-display text-lg">
                    {pron.words.map((w, i) => (
                      <span
                        key={i}
                        title={
                          w.status === "close"
                            ? `A Luna ouviu “${w.heard}”`
                            : w.status === "missed"
                              ? "Não ouvido"
                              : undefined
                        }
                        className={cn(
                          "rounded px-0.5",
                          w.status === "ok" && "text-olive",
                          w.status === "close" &&
                            "bg-azul-pale text-azul underline decoration-dotted",
                          w.status === "missed" && "bg-terra-pale text-terra-dark",
                          i === target.wordIndex && "ring-1 ring-sage"
                        )}
                      >
                        {w.word}
                      </span>
                    ))}
                  </p>
                </div>
                <p className="text-[11px] text-ink-faint">
                  A nota é da frase toda; a pergunta conta pela palavra
                  destacada — the conjugated form is what is being marked.
                </p>
                {tips.length > 0 ? (
                  <ul className="space-y-1.5">
                    {tips.map((t, i) => (
                      <li
                        key={i}
                        className="rounded-xl bg-azul-pale px-3 py-2 text-sm text-azul"
                      >
                        💡 <Markdown className="inline text-[14px]">{t}</Markdown>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {verdict !== null ? (
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm",
              verdict === "certo"
                ? "bg-sage-pale text-olive"
                : verdict === "quase"
                  ? "bg-azul-pale text-azul"
                  : "bg-terra-pale text-terra-dark"
            )}
          >
            <div className="flex-1">
              {verdict === "certo" ? (
                <>Certo! ✓</>
              ) : verdict === "quase" ? (
                <>
                  Quase — <strong className="font-display text-base">{q.slot.answer}</strong>
                  {note ? <> ({note})</> : null}
                </>
              ) : (
                <>
                  A forma certa é{" "}
                  <strong className="font-display text-base">{q.slot.answer}</strong>
                </>
              )}
            </div>
            <AudioButton text={q.slot.answer} />
          </div>
        ) : null}
      </div>

      {verdict === null ? (
        q.type === "escrever" ? (
          <button
            className="btn-terra w-full"
            onClick={checkTyped}
            disabled={!typed.trim()}
          >
            Corrigir ✓
          </button>
        ) : null
      ) : (
        <button className="btn-primary w-full" onClick={() => void next()}>
          {index === round.length - 1 ? "Terminar" : "Próximo →"}
        </button>
      )}
    </div>
  );
}
