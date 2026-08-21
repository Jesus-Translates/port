"use client";

import { useMemo, useState, useTransition } from "react";
import { AnswerDiff } from "@/components/answer-diff";
import { AudioButton } from "@/components/audio-button";
import Link from "next/link";
import { Bi } from "@/components/bilingual";
import { Markdown } from "@/components/markdown";
import { UnitContinue } from "@/components/unit-return";
import type { UnitContext } from "@/lib/unit-context";
import {
  deleteHomework,
  enhanceHomework,
  regradeHomeworkItem,
  requestFeedback,
  retryHomeworkItem,
  splitIntoItems,
  submitHomeworkItem,
  submitHomework,
} from "@/lib/actions/homework";
import { checkAnswer } from "@/lib/diff";
import { type HomeworkItem, itemProgress } from "@/lib/homework-items";
import { cn } from "@/lib/utils";

export function HomeworkWork({
  homework,
  isOwner,
  ownerName,
  unit = null,
}: {
  /** Set when this TPC was opened from a unit path, so the finish sends the
   *  learner back to the course rather than to a list of other homework. */
  unit?: UnitContext | null;
  homework: {
    id: number;
    status: string;
    response: string | null;
    feedback: string | null;
    items: HomeworkItem[] | null;
    canSplit: boolean;
  };
  isOwner: boolean;
  ownerName: string;
}) {
  if (homework.items && homework.items.length > 0) {
    return (
      <ItemisedHomework
        homeworkId={homework.id}
        items={homework.items}
        isOwner={isOwner}
        ownerName={ownerName}
        unit={unit}
      />
    );
  }
  return (
    <LegacyHomework
      homework={homework}
      isOwner={isOwner}
      ownerName={ownerName}
    />
  );
}

/* ---------------------------------------------------------------- items */

function ItemisedHomework({
  homeworkId,
  items,
  isOwner,
  ownerName,
  unit,
}: {
  homeworkId: number;
  items: HomeworkItem[];
  isOwner: boolean;
  ownerName: string;
  unit: UnitContext | null;
}) {
  const { done, total, ungraded, correct, allDone } = itemProgress(items);

  return (
    <div className="space-y-4">
      {/* top-14 on phones: the mobile header has no pill row, so it's shorter */}
      <div className="card sticky top-14 z-30 flex items-center gap-3 p-3 sm:top-[4.25rem]">
        <div className="flex flex-1 items-center gap-1">
          {items.map((i) => (
            <span
              key={i.n}
              title={`Pergunta ${i.n}`}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                i.answer === null
                  ? "bg-sand"
                  : i.correct === null
                    ? "bg-azul" // answered, grading pending — not wrong
                    : i.correct
                      ? "bg-olive"
                      : "bg-terra"
              )}
            />
          ))}
        </div>
        <span className="shrink-0 text-xs font-medium text-ink-soft">
          {done}/{total}
          {done > 0 ? ` · ${correct} ✓` : ""}
          {ungraded > 0 ? ` · ${ungraded} ⏳` : ""}
        </span>
      </div>

      {done === total && ungraded > 0 ? (
        <div className="card border-azul/30 bg-azul-pale/50 p-4 text-sm text-azul">
          ⏳ Tudo respondido — {ungraded === 1 ? "falta 1 correção" : `faltam ${ungraded} correções`} da Sandra. Pede a correção nas perguntas marcadas.
        </div>
      ) : null}

      {items.map((item) => (
        <ItemCard
          key={item.n}
          homeworkId={homeworkId}
          item={item}
          isOwner={isOwner}
          ownerName={ownerName}
        />
      ))}

      {/* The completion moment belongs where the learner actually is — at the
          bottom, having just answered the last question. It used to render
          above all the questions, so finishing produced nothing visible. */}
      {allDone ? (
        <div className="card border-sage bg-sage-pale/50 p-5 text-center">
          <div className="text-4xl" aria-hidden>
            {correct === total ? "🏆" : correct >= total / 2 ? "💪" : "🌱"}
          </div>
          <div className="mt-2 font-display text-2xl font-semibold">
            {correct}/{total} certas
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            {correct === total
              ? "Perfeito! Não erraste nada. 🎉"
              : "TPC entregue — as correções da Sandra estão acima, e os erros já foram para o teu baralho."}
          </p>
          {unit ? (
            <div className="mt-4">
              {/* Record how it went, like every other activity does — the item
                  stores a 0-100 and the unit bar reflects real performance
                  rather than mere attendance. */}
              <UnitContinue
                unit={unit}
                score={total > 0 ? Math.round((correct / total) * 100) : null}
              />
            </div>
          ) : (
            <Link href="/homework" className="btn-ghost mt-4 inline-block">
              <Bi pt="← Todos os TPC" en="All homework" inline />
            </Link>
          )}
        </div>
      ) : null}
    </div>
  );
}

function ItemCard({
  homeworkId,
  item,
  isOwner,
  ownerName,
}: {
  homeworkId: number;
  item: HomeworkItem;
  isOwner: boolean;
  ownerName: string;
}) {
  const [answer, setAnswer] = useState(item.answer ?? "");
  const [pending, startTransition] = useTransition();
  const answered = item.answer !== null;
  const ungraded = answered && item.correct === null;

  // Word-level diff whenever we have both sides. Skipped when the "correction"
  // is identical to the answer (nothing to point at) — the plain answer box
  // still shows below in that case.
  const diff = useMemo(() => {
    const given = item.answer?.trim();
    const right = item.correctedPt?.trim();
    if (!given || !right) return null;
    // A free-writing answer against a one-sentence model answer isn't a diff,
    // it's noise — fall back to the plain answer + correction boxes there.
    const words = (s: string) => s.split(/\s+/).length;
    if (words(right) > 30 || words(given) > 30) return null;
    if (words(given) > words(right) * 2 + 4) return null;
    const check = checkAnswer(right, given);
    return check.verdict === "certo" ? null : check;
  }, [item.answer, item.correctedPt]);

  function submit() {
    if (!answer.trim()) return;
    startTransition(async () => {
      await submitHomeworkItem(homeworkId, item.n, answer);
    });
  }

  return (
    <section
      className={cn(
        "card overflow-hidden",
        answered && item.correct === true && "border-sage",
        answered && item.correct === false && "border-terra/50",
        ungraded && "border-azul/40"
      )}
    >
      <div className="flex items-start gap-3 p-4 pb-3">
        <span
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold",
            !answered && "bg-sand text-ink-soft",
            ungraded && "bg-azul text-paper",
            answered && item.correct === true && "bg-olive text-paper",
            answered && item.correct === false && "bg-terra text-paper"
          )}
        >
          {!answered
            ? item.n
            : ungraded
              ? "⏳"
              : item.correct
                ? item.verdict === "quase"
                  ? "~"
                  : "✓"
                : "!"}
        </span>
        <div className="min-w-0 flex-1">
          {item.section ? (
            <div className="text-2xs font-semibold tracking-wide text-ink-faint uppercase">
              {item.section}
            </div>
          ) : null}
          <p className="font-display text-[17px] leading-snug">{item.prompt}</p>
          {item.hint && !answered ? (
            <p className="mt-1 text-xs text-ink-faint">💡 {item.hint}</p>
          ) : null}
        </div>
      </div>

      <div className="px-4 pb-4">
        {!answered ? (
          isOwner ? (
            <div className="space-y-2">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  // ⌘/Ctrl+Enter submits without reaching for the mouse.
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
                }}
                rows={2}
                disabled={pending}
                className="input resize-y"
                placeholder="Escreve a tua resposta em português…"
              />
              <button
                className="btn-terra w-full sm:w-auto"
                onClick={submit}
                disabled={pending || !answer.trim()}
              >
                {pending ? (
                  <Bi pt="A Sandra está a corrigir…" en="Sandra is grading it…" inline />
                ) : (
                  <Bi pt="Responder ✓" en="Answer" inline />
                )}
              </button>
            </div>
          ) : (
            <p className="text-sm text-ink-faint">
              <span className="capitalize">{ownerName}</span> ainda não
              respondeu.
            </p>
          )
        ) : (
          <div className="space-y-2">
            {diff ? null : (
              <div className="rounded-xl border border-sand bg-cream/60 px-3 py-2">
                <div className="text-2xs font-semibold tracking-wide text-ink-faint uppercase">
                  Resposta
                </div>
                <p className="text-[15px] whitespace-pre-wrap">{item.answer}</p>
              </div>
            )}

            {ungraded ? (
              <div className="space-y-2 rounded-xl border border-azul/30 bg-azul-pale/50 px-3 py-2">
                <p className="text-sm text-azul">
                  ⏳ A tua resposta ficou guardada, mas a correção da Sandra não
                  chegou. Não conta como errada.
                </p>
                {isOwner ? (
                  <button
                    className="btn-terra text-xs"
                    disabled={pending}
                    onClick={() =>
                      startTransition(() =>
                        regradeHomeworkItem(homeworkId, item.n)
                      )
                    }
                  >
                    {pending ? (
                      <Bi pt="A Sandra está a corrigir…" en="Sandra is grading it…" inline />
                    ) : (
                      <Bi pt="👩‍🏫 Pedir a correção" en="Ask for grading" inline />
                    )}
                  </button>
                ) : null}
              </div>
            ) : null}

            {diff ? (
              // Word by word: what they wrote over what it should have been.
              <AnswerDiff check={diff} nearMiss={item.verdict === "quase"} />
            ) : (
              <>
                {item.verdict === "quase" ? (
                  <p className="text-sm font-semibold text-terra-dark">
                    Quase! A ideia estava certa — só a escrita escorregou.
                  </p>
                ) : null}

                {item.correctedPt ? (
                  <div className="rounded-xl border border-sage bg-sage-pale/60 px-3 py-2">
                    <div className="text-2xs font-semibold tracking-wide text-olive uppercase">
                      Assim fica certo
                    </div>
                    <div className="flex items-start gap-2">
                      <p className="flex-1 font-display text-[16px]">
                        {item.correctedPt}
                      </p>
                      <AudioButton text={item.correctedPt} className="mt-0.5 shrink-0" />
                    </div>
                  </div>
                ) : null}
              </>
            )}

            {item.feedbackMd ? (
              <div className="flex gap-2 rounded-xl bg-white/70 px-3 py-2">
                <span className="shrink-0" aria-hidden>
                  👩‍🏫
                </span>
                <Markdown className="text-[14px]">{item.feedbackMd}</Markdown>
              </div>
            ) : null}

            {item.tip ? (
              <p className="rounded-xl bg-azul-pale px-3 py-2 text-[14px] text-azul">
                💡 <span className="font-semibold">Para a próxima:</span>{" "}
                {item.tip}
              </p>
            ) : null}

            {isOwner ? (
              <button
                className="text-xs text-ink-faint underline-offset-2 hover:text-terra hover:underline"
                onClick={() =>
                  startTransition(() => retryHomeworkItem(homeworkId, item.n))
                }
                disabled={pending}
              >
                <Bi pt="Tentar outra vez" en="Try again" inline />
              </button>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- legacy */

function LegacyHomework({
  homework,
  isOwner,
  ownerName,
}: {
  homework: {
    id: number;
    status: string;
    response: string | null;
    feedback: string | null;
    canSplit: boolean;
  };
  isOwner: boolean;
  ownerName: string;
}) {
  const [response, setResponse] = useState(homework.response ?? "");
  const [pending, startTransition] = useTransition();
  const [working, setWorking] = useState<"submit" | "enhance" | null>(null);

  if (pending && working === "submit") {
    return (
      <div className="card p-10 text-center">
        <div className="mb-3 animate-pulse text-4xl" aria-hidden>
          👩‍🏫
        </div>
        <p className="font-medium">A Sandra está a corrigir o teu trabalho…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {homework.status === "open" ? (
        isOwner ? (
          <section className="card space-y-3 p-5">
            {homework.canSplit ? (
              <button
                className="btn-ghost w-full"
                onClick={() => startTransition(() => splitIntoItems(homework.id))}
                disabled={pending}
              >
                <Bi
                  pt="✂️ Responder pergunta a pergunta (com correção imediata)"
                  en="Answer question by question (with instant grading)"
                  inline
                />
              </button>
            ) : null}
            <h2 className="font-semibold">✍️ A tua resposta</h2>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={10}
              className="input resize-y"
              placeholder="Escreve as tuas respostas em português…"
            />
            <div className="flex flex-wrap gap-2">
              <button
                className="btn-terra"
                onClick={() => {
                  setWorking("submit");
                  startTransition(async () => {
                    await submitHomework(homework.id, response);
                    setWorking(null);
                  });
                }}
                disabled={pending || !response.trim()}
              >
                <Bi pt="Entregar à Sandra ✓" en="Hand in to Sandra" inline />
              </button>
              <button
                className="btn-ghost"
                onClick={() => {
                  setWorking("enhance");
                  startTransition(async () => {
                    await enhanceHomework(homework.id);
                    setWorking(null);
                  });
                }}
                disabled={pending}
              >
                {pending && working === "enhance" ? (
                  <Bi pt="A Sandra está a melhorar…" en="Sandra is improving it…" inline />
                ) : (
                  <Bi pt="✨ Melhorar o TPC" en="Improve the homework" inline />
                )}
              </button>
              <button
                className="btn-ghost text-terra-dark"
                onClick={() => {
                  if (confirm("Apagar este TPC?")) {
                    startTransition(() => deleteHomework(homework.id));
                  }
                }}
                disabled={pending}
              >
                <Bi pt="Apagar" en="Delete" inline />
              </button>
            </div>
          </section>
        ) : (
          <p className="card p-5 text-sm text-ink-soft">
            <span className="capitalize">{ownerName}</span> ainda não entregou
            este TPC.
          </p>
        )
      ) : (
        <>
          <section className="card p-5">
            <h2 className="mb-2 font-semibold">
              ✍️ Resposta de <span className="capitalize">{ownerName}</span>
            </h2>
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
              {homework.response}
            </p>
          </section>
          {homework.feedback ? (
            <section className="card border-sage bg-sage-pale/40 p-5">
              <h2 className="mb-2 font-semibold">👩‍🏫 Feedback da Sandra</h2>
              <Markdown>{homework.feedback}</Markdown>
            </section>
          ) : (
            <div className="card space-y-3 p-5">
              <p className="text-sm text-ink-soft">
                Entregue — a correção da Sandra ainda não chegou.
              </p>
              {isOwner ? (
                <button
                  className="btn-terra"
                  disabled={pending}
                  onClick={() =>
                    startTransition(() => requestFeedback(homework.id))
                  }
                >
                  {pending ? (
                    <Bi pt="A Sandra está a corrigir…" en="Sandra is grading it…" inline />
                  ) : (
                    <Bi pt="👩‍🏫 Pedir a correção" en="Ask for grading" inline />
                  )}
                </button>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}
