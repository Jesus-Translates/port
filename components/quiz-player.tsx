"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnswerDiff } from "@/components/answer-diff";
import { Bi, useBilingual } from "@/components/bilingual";
import { AudioButton } from "@/components/audio-button";
import { Recorder } from "@/components/recorder";
import { WordBuilder, type WordTile } from "@/components/word-builder";
import { completeItem } from "@/lib/actions/course";
import { gradeStep, submitQuiz } from "@/lib/actions/quiz";
import type { AnswerCheck } from "@/lib/diff";
import { cn } from "@/lib/utils";

export type PlayerQuestion = {
  type: "multiple" | "translate" | "wordbank" | "speak" | "dialogue";
  promptPt?: string;
  promptEn: string;
  options?: string[];
  /** dialogue only: the line being answered. */
  speakerPt?: string;
  speakerEn?: string;
};

type Verdict = {
  correct: boolean;
  verdict: "certo" | "quase" | "errado";
  answer: string;
  explanation: string;
  check: AnswerCheck | null;
};

/** Every step is worth the same: the drill rewards finishing, not cherry-picking. */
const XP_PER_STEP = 7;

/**
 * The drill loop.
 *
 * One step at a time with a single primary button that grades, then advances —
 * rather than a form you fill in and hand over. The learner finds out
 * immediately, which is the only moment feedback actually teaches.
 *
 * The check is a SERVER call on purpose. Grading in the browser would mean
 * shipping every answer to it, and the point of gradeStep() is that it is
 * deterministic and free — no model call per tap. The AI grader still runs
 * once on hand-in, and being more lenient it can only upgrade a verdict the
 * learner already saw.
 */
export function QuizPlayer({
  quizId,
  questions,
  unitItemId = null,
}: {
  quizId: number;
  questions: PlayerQuestion[];
  /** When a unit path asked for this quiz, tick that step off on submit. */
  unitItemId?: number | null;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(
    Array(questions.length).fill("")
  );
  const [placed, setPlaced] = useState<number[]>([]);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [xp, setXp] = useState(0);
  // A hook, so it must sit above the early returns for `busy` and `!q`.
  const bilingual = useBilingual();
  const gloss = (pt: string, en: string) => (bilingual ? `${pt} · ${en}` : pt);

  const q = questions[index];
  const last = index === questions.length - 1;
  const answer = answers[index] ?? "";

  // Tiles come from the answer, which the browser never sees — so the bank is
  // built from what the learner has placed plus the shuffled words the server
  // sent as options. For wordbank the generator puts the shuffled words there.
  const tiles: WordTile[] = (q?.options ?? []).map((word, id) => ({ id, word }));

  function setAnswer(value: string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  async function check() {
    if (checking || verdict) return;
    setChecking(true);
    try {
      const r = await gradeStep(quizId, index, answer);
      if (r) {
        setVerdict(r);
        if (r.correct) setXp((x) => x + XP_PER_STEP);
      }
    } catch {
      // A failed check must not strand the learner mid-drill: let them move on
      // and be graded properly on hand-in.
      setVerdict({
        correct: true,
        verdict: "certo",
        answer: "",
        explanation: "",
        check: null,
      });
    } finally {
      setChecking(false);
    }
  }

  function advance() {
    setVerdict(null);
    setPlaced([]);
    setIndex((i) => i + 1);
  }

  async function finish() {
    setBusy(true);
    setFailed(false);
    try {
      const results = await submitQuiz(quizId, answers);
      // Handing the quiz in IS the completion. Fire and forget on purpose: a
      // failed tick must never turn a graded quiz into an error screen.
      if (unitItemId && results) {
        const right = results.filter((r) => r.correct).length;
        const pct = Math.round((right / Math.max(questions.length, 1)) * 100);
        void completeItem(unitItemId, pct).catch(() => {});
      }
      router.refresh();
    } catch {
      // Handing back the whole quiz is the highest-stakes moment here: an
      // alert() that can be dismissed leaves the learner unsure whether their
      // answers survived. Stay on the page, keep every answer, offer a retry.
      setBusy(false);
      setFailed(true);
    }
  }

  if (busy) {
    return (
      <div className="card p-10 text-center">
        <div className="mb-3 animate-pulse text-4xl" aria-hidden>
          👩‍🏫
        </div>
        <p className="font-medium">A Sandra está a corrigir…</p>
        <p className="mt-1 text-sm text-ink-soft">
          Grading your answers — a few seconds.
        </p>
      </div>
    );
  }

  if (!q) return null;

  // Read-aloud has no gate: the Recorder owns its own scoring, and a
  // "Verificar" that compares nothing would be theatre.
  const isSpeak = q.type === "speak";
  const hasAnswer =
    isSpeak ||
    (q.type === "wordbank" ? placed.length > 0 : answer.trim().length > 0);
  const primaryLabel =
    isSpeak || verdict
      ? last
        ? gloss("Entregar ✓", "Hand in")
        : gloss("Continuar →", "Continue")
      : gloss("Verificar", "Check");

  function onPrimary() {
    if (!isSpeak && !verdict) return void check();
    if (last) return void finish();
    advance();
  }

  return (
    <div className="column-phone space-y-4">
      {/* Top bar: where you are, and one way out. */}
      <div className="sticky top-0 z-20 -mx-4 bg-paper/95 px-4 pt-2 pb-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Sair da lição"
            className="grid size-8 shrink-0 place-items-center rounded-[10px] border border-sand bg-white text-ink-soft transition-colors hover:border-terra hover:text-terra"
          >
            ✕
          </button>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-sand">
            <div
              className="h-2.5 rounded-full bg-olive transition-[width] duration-[400ms] ease-out"
              style={{
                width: `${(index / Math.max(1, questions.length)) * 100}%`,
              }}
            />
          </div>
          <span className="shrink-0 font-display text-[15px] font-semibold text-terra tabular-nums">
            {xp} XP
          </span>
        </div>
      </div>

      <div className="animate-ph-rise space-y-4">
        <p className="label mb-0">
          <Bi pt={STEP_LABEL[q.type].pt} en={STEP_LABEL[q.type].en} inline />
        </p>

        {q.type === "dialogue" ? (
          <DialogueBody q={q} />
        ) : (
          <div>
            <p className="font-display text-xl leading-snug">{q.promptEn}</p>
            {q.promptPt ? (
              <p className="mt-1 text-sm text-ink-soft">{q.promptPt}</p>
            ) : null}
          </div>
        )}

        {q.type === "multiple" || q.type === "dialogue" ? (
          <div className="grid gap-2.5">
            {(q.options ?? []).map((opt) => (
              <OptionButton
                key={opt}
                label={opt}
                selected={answer === opt}
                state={
                  !verdict
                    ? "idle"
                    : opt === verdict.answer
                      ? "correct"
                      : answer === opt
                        ? "wrong"
                        : "idle"
                }
                disabled={Boolean(verdict)}
                onClick={() => setAnswer(opt)}
              />
            ))}
          </div>
        ) : null}

        {q.type === "wordbank" ? (
          <WordBuilder
            tiles={tiles}
            placed={placed}
            onChange={(next) => {
              setPlaced(next);
              setAnswer(
                next.map((id) => tiles.find((t) => t.id === id)?.word ?? "").join(" ")
              );
            }}
            disabled={Boolean(verdict)}
            state={
              verdict ? (verdict.correct ? "correct" : "wrong") : "idle"
            }
            placeholder="Toca ou arrasta as palavras pela ordem certa…"
          />
        ) : null}

        {q.type === "translate" ? (
          <div>
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && hasAnswer) onPrimary();
              }}
              disabled={Boolean(verdict)}
              className="input font-display text-[17px]"
              placeholder="Escreve aqui…"
              lang="pt-PT"
              autoFocus
            />
            <p className="mt-1.5 text-xs text-ink-faint">
              <Bi
                pt="Cuidado com os acentos — contam."
                en="Mind the accents — they count."
                inline
              />
            </p>
          </div>
        ) : null}

        {isSpeak ? (
          <div className="card space-y-3 p-5">
            <p className="font-display text-[26px] leading-snug font-medium tracking-[-.01em]">
              {q.promptPt ?? q.promptEn}
            </p>
            <div className="flex items-center gap-3 border-t border-cream pt-3">
              <AudioButton text={q.promptPt ?? q.promptEn} />
              <span className="text-xs text-ink-faint">
                Ouve primeiro, depois grava.
              </span>
            </div>
            {/* Under the sentence it scores — never floating alone. */}
            <Recorder mode="read" target={q.promptPt ?? q.promptEn} />
          </div>
        ) : null}

        {/* The near-miss diff: which word slipped, not just "wrong". */}
        {verdict?.check && verdict.verdict !== "certo" ? (
          <AnswerDiff
            check={verdict.check}
            nearMiss={verdict.verdict === "quase"}
          />
        ) : null}
      </div>

      {failed ? (
        <div
          role="alert"
          className="card space-y-2 border-terra/50 bg-terra-pale/60 p-4"
        >
          <p className="text-sm font-semibold text-terra-dark">
            A entrega não foi — mas nada se perdeu.
          </p>
          <p className="text-sm text-ink-soft">
            Couldn&apos;t hand this in. Every answer is still here on this
            screen — check your connection and try again.
          </p>
          <button className="btn-terra" onClick={finish}>
            Tentar entregar outra vez ✓
          </button>
        </div>
      ) : null}

      {/* Footer: the feedback banner, then one button. */}
      <div className="sticky bottom-0 -mx-4 space-y-3 border-t border-cream bg-paper px-4 pt-3.5 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        {verdict ? (
          <p
            role="status"
            className={cn(
              "animate-ph-rise rounded-[13px] px-4 py-3 text-[13.5px] leading-snug font-medium",
              verdict.correct
                ? "bg-sage-pale text-olive"
                : "bg-terra-pale text-terra-dark"
            )}
          >
            {verdict.correct
              ? verdict.verdict === "quase"
                ? `Quase! ${verdict.explanation || "Só a escrita escorregou."}`
                : verdict.explanation || "Certo!"
              : `${verdict.answer ? `${verdict.answer}. ` : ""}${verdict.explanation}`}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onPrimary}
          disabled={!hasAnswer || checking}
          className={cn(
            "flex min-h-[52px] w-full items-center justify-center rounded-2xl text-[15.5px] font-semibold transition-all",
            hasAnswer && !checking
              ? "bg-olive text-paper hover:bg-ink"
              : "cursor-not-allowed bg-cream text-ink-faint"
          )}
        >
          {checking ? gloss("A ver…", "Checking…") : primaryLabel}
        </button>
        <p className="text-center text-2xs text-ink-faint">
          {index + 1} de {questions.length}
        </p>
      </div>
    </div>
  );
}

const STEP_LABEL: Record<PlayerQuestion["type"], { pt: string; en: string }> = {
  multiple: { pt: "Escolhe a certa", en: "Pick the right one" },
  translate: { pt: "Escreve em português", en: "Write it in Portuguese" },
  wordbank: { pt: "Constrói a frase", en: "Build the sentence" },
  speak: { pt: "Lê em voz alta", en: "Read it aloud" },
  dialogue: { pt: "Diálogo", en: "Conversation" },
};

function OptionButton({
  label,
  selected,
  state,
  disabled,
  onClick,
}: {
  label: string;
  selected: boolean;
  state: "idle" | "correct" | "wrong";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      lang="pt-PT"
      className={cn(
        "min-h-14 w-full rounded-[15px] border-[1.5px] px-4 py-3.5 text-left text-[15px] transition-all",
        state === "correct"
          ? "border-olive bg-sage-pale text-ink"
          : state === "wrong"
            ? "border-terra bg-terra-pale text-terra-dark"
            : selected
              ? "border-ink bg-white"
              : "border-sand bg-white hover:border-sage"
      )}
    >
      {label}
    </button>
  );
}

/** The other person's line, then the learner's empty turn. */
function DialogueBody({ q }: { q: PlayerQuestion }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[11px] bg-azul-pale font-display text-sm font-semibold text-azul">
          {(q.speakerPt ?? "E").trim().charAt(0).toUpperCase()}
        </span>
        <div className="flex-1 rounded-[14px] border border-sand bg-white px-4 py-3">
          <p className="font-display text-[17px] leading-snug">{q.speakerPt}</p>
          {q.speakerEn ? (
            <p className="mt-0.5 text-[12.5px] text-ink-faint">{q.speakerEn}</p>
          ) : null}
          <div className="mt-2">
            <AudioButton text={q.speakerPt ?? ""} />
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[11px] bg-sage-pale font-display text-sm font-semibold text-olive">
          Tu
        </span>
        <div className="flex-1 rounded-[14px] border border-dashed border-sage-light bg-sage-pale/50 px-4 py-3">
          <p className="font-display text-[17px] text-olive">…a tua vez</p>
        </div>
      </div>
      <p className="text-[12.5px] font-semibold text-ink-soft">
        {q.promptEn}
      </p>
    </div>
  );
}
