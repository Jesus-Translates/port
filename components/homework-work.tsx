"use client";

import { useState, useTransition } from "react";
import { Markdown } from "@/components/markdown";
import {
  deleteHomework,
  enhanceHomework,
  requestFeedback,
  retryHomeworkItem,
  splitIntoItems,
  submitHomeworkItem,
  submitHomework,
} from "@/lib/actions/homework";
import { type HomeworkItem, itemProgress } from "@/lib/homework-items";
import { cn } from "@/lib/utils";

export function HomeworkWork({
  homework,
  isOwner,
  ownerName,
}: {
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
}: {
  homeworkId: number;
  items: HomeworkItem[];
  isOwner: boolean;
  ownerName: string;
}) {
  const { done, total, allDone } = itemProgress(items);
  const correct = items.filter((i) => i.correct === true).length;
  const answered = items.filter((i) => i.answer !== null).length;

  return (
    <div className="space-y-4">
      <div className="card sticky top-[4.25rem] z-30 flex items-center gap-3 p-3">
        <div className="flex flex-1 items-center gap-1">
          {items.map((i) => (
            <span
              key={i.n}
              title={`Pergunta ${i.n}`}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                i.answer === null
                  ? "bg-sand"
                  : i.correct
                    ? "bg-olive"
                    : "bg-terra"
              )}
            />
          ))}
        </div>
        <span className="shrink-0 text-xs font-medium text-ink-soft">
          {done}/{total}
          {answered > 0 ? ` · ${correct} ✓` : ""}
        </span>
      </div>

      {allDone ? (
        <div className="card flex items-center gap-4 border-sage bg-sage-pale/50 p-5">
          <span className="text-4xl" aria-hidden>
            {correct === total ? "🏆" : correct >= total / 2 ? "💪" : "🌱"}
          </span>
          <div>
            <div className="font-display text-xl font-semibold">
              {correct}/{total} certas
            </div>
            <p className="text-sm text-ink-soft">
              {correct === total
                ? "Perfeito! Não erraste nada. 🎉"
                : "TPC entregue — revê as correções da Luna abaixo."}
            </p>
          </div>
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
        answered && item.correct === false && "border-terra/50"
      )}
    >
      <div className="flex items-start gap-3 p-4 pb-3">
        <span
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold",
            answered
              ? item.correct
                ? "bg-olive text-paper"
                : "bg-terra text-paper"
              : "bg-sand text-ink-soft"
          )}
        >
          {answered ? (item.correct ? (item.verdict === "quase" ? "~" : "✓") : "!") : item.n}
        </span>
        <div className="min-w-0 flex-1">
          {item.section ? (
            <div className="text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
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
                {pending ? "A Luna está a corrigir…" : "Responder ✓"}
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
            <div className="rounded-xl border border-sand bg-cream/60 px-3 py-2">
              <div className="text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                Resposta
              </div>
              <p className="text-[15px] whitespace-pre-wrap">{item.answer}</p>
            </div>

            {item.verdict === "quase" ? (
              <p className="text-sm font-semibold text-terra-dark">
                Quase! A ideia estava certa — só a escrita escorregou.
              </p>
            ) : null}

            {item.correctedPt ? (
              <div className="rounded-xl border border-sage bg-sage-pale/60 px-3 py-2">
                <div className="text-[11px] font-semibold tracking-wide text-olive uppercase">
                  Assim fica certo
                </div>
                <p className="font-display text-[16px]">{item.correctedPt}</p>
              </div>
            ) : null}

            {item.feedbackMd ? (
              <div className="flex gap-2 rounded-xl bg-white/70 px-3 py-2">
                <span className="shrink-0" aria-hidden>
                  🌙
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
                Tentar outra vez
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
          🌙
        </div>
        <p className="font-medium">A Luna está a corrigir o teu trabalho…</p>
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
                ✂️ Responder pergunta a pergunta (com correção imediata)
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
                Entregar à Luna ✓
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
                {pending && working === "enhance"
                  ? "A Luna está a melhorar…"
                  : "✨ Melhorar o TPC"}
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
                Apagar
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
              <h2 className="mb-2 font-semibold">🌙 Feedback da Luna</h2>
              <Markdown>{homework.feedback}</Markdown>
            </section>
          ) : (
            <div className="card space-y-3 p-5">
              <p className="text-sm text-ink-soft">
                Entregue — a correção da Luna ainda não chegou.
              </p>
              {isOwner ? (
                <button
                  className="btn-terra"
                  disabled={pending}
                  onClick={() =>
                    startTransition(() => requestFeedback(homework.id))
                  }
                >
                  {pending ? "A Luna está a corrigir…" : "🌙 Pedir a correção"}
                </button>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}
