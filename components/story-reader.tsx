"use client";

import { useState, useTransition } from "react";
import { Bi } from "@/components/bilingual";
import { UnitContinue } from "@/components/unit-return";
import { completeItem } from "@/lib/actions/course";
import { finishStory, saveGlossaryWord } from "@/lib/actions/stories";
import type { UnitContext } from "@/lib/unit-context";
import { cn } from "@/lib/utils";

type Story = {
  id: number;
  title: string;
  textPt: string;
  textEn: string;
  glossary: { pt: string; en: string }[];
  questions: { promptPt: string; options: string[]; answer: string }[];
};

export function StoryReader({
  story,
  unit = null,
}: {
  story: Story;
  /** The course step this chapter is fulfilling, when there is one. */
  unit?: UnitContext | null;
}) {
  const [showEn, setShowEn] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  /** True only once the unit step really was ticked — never claimed on faith. */
  const [unitTicked, setUnitTicked] = useState(false);
  const [, startTransition] = useTransition();

  const ptParas = story.textPt.split(/\n+/).filter(Boolean);
  const enParas = story.textEn.split(/\n+/).filter(Boolean);
  const score = story.questions.filter(
    (q, i) => answers[i] === q.answer
  ).length;

  function submit() {
    if (submitted) return;
    setSubmitted(true);
    startTransition(() =>
      finishStory(story.id, story.title, score, story.questions.length)
    );
    // Answering the comprehension check is the end of the chapter — the score
    // out of 100 is exactly what the unit should record. Fired defensively:
    // a failure here must never cost the learner the reading they just did.
    if (unit?.itemId) {
      const pct =
        story.questions.length > 0
          ? Math.round((score / story.questions.length) * 100)
          : null;
      void completeItem(unit.itemId, pct)
        .then((r) => {
          if (r.ok) setUnitTicked(true);
        })
        .catch(() => {});
    }
  }

  return (
    <div className="space-y-5">
      <section className="card space-y-4 p-6">
        {ptParas.map((p, i) => (
          <div key={i}>
            <p className="font-display text-[17px] leading-relaxed">{p}</p>
            {showEn && enParas[i] ? (
              <p className="mt-1 text-sm text-ink-faint italic">{enParas[i]}</p>
            ) : null}
          </div>
        ))}
        <button
          className="btn-ghost text-xs"
          onClick={() => setShowEn((s) => !s)}
        >
          {showEn ? (
            <Bi pt="Esconder inglês" en="Hide English" inline />
          ) : (
            <Bi pt="Mostrar tradução" en="Show translation" inline />
          )}
        </button>
      </section>

      <section className="card p-5">
        <h2 className="mb-2 font-semibold">📖 Glossário</h2>
        <p className="mb-3 text-xs text-ink-faint">
          Toca numa palavra para a juntar ao teu baralho de revisão.
        </p>
        <div className="flex flex-wrap gap-2">
          {story.glossary.map((g) => {
            const isSaved = saved.has(g.pt);
            return (
              <button
                key={g.pt}
                disabled={isSaved}
                onClick={() => {
                  setSaved((s) => new Set(s).add(g.pt));
                  startTransition(() => saveGlossaryWord(g.pt, g.en));
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  isSaved
                    ? "border-sage bg-sage-pale text-olive"
                    : "border-sand bg-white/70 hover:border-sage hover:bg-sage-pale"
                )}
              >
                <span className="font-medium">{g.pt}</span>
                <span className="text-ink-faint"> · {g.en}</span>
                {isSaved ? " ✓" : " +"}
              </button>
            );
          })}
        </div>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="font-semibold">🤔 Percebeste?</h2>
        {story.questions.map((q, i) => (
          <div key={i}>
            <p className="font-medium">
              {i + 1}. {q.promptPt}
            </p>
            <div className="mt-2 grid gap-1.5">
              {q.options.map((opt) => {
                const chosen = answers[i] === opt;
                const right = submitted && opt === q.answer;
                const wrong = submitted && chosen && opt !== q.answer;
                return (
                  <button
                    key={opt}
                    disabled={submitted}
                    onClick={() => setAnswers((a) => ({ ...a, [i]: opt }))}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                      right
                        ? "border-olive bg-sage-pale text-olive"
                        : wrong
                          ? "border-terra bg-terra-pale text-terra-dark"
                          : chosen
                            ? "border-olive bg-olive text-paper"
                            : "border-sand bg-white/70 hover:border-sage"
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {!submitted ? (
          <button
            className="btn-terra w-full"
            disabled={Object.keys(answers).length < story.questions.length}
            onClick={submit}
          >
            <Bi pt="Corrigir ✓" en="Check answers" inline />
          </button>
        ) : (
          <p className="rounded-xl bg-sage-pale/70 px-3 py-2 text-center text-sm font-medium text-olive">
            {score}/{story.questions.length}{" "}
            {score === story.questions.length
              ? "— percebeste tudo! 🎉"
              : "— relê e tenta o próximo capítulo!"}
          </p>
        )}
      </section>

      {/* Finishing the chapter is finishing the step: the loudest button goes
          back to the course, not on to an unrelated series. */}
      {unit && submitted ? (
        <section className="card space-y-2 p-5">
          <p className="text-sm text-ink-soft">
            {unitTicked
              ? `✓ Passo concluído na unidade ${unit.title}.`
              : `Capítulo lido — volta à unidade ${unit.title} para continuares.`}
          </p>
          <UnitContinue unit={unit} />
        </section>
      ) : null}
    </div>
  );
}
