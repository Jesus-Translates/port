"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { planHref, type LearningPlan } from "@/lib/placement-record";

const KIND_EMOJI: Record<string, string> = {
  unidade: "📚",
  verbos: "⚡",
  ditado: "✏️",
  conversa: "💬",
  jogos: "🎲",
  reference: "📖",
  quiz: "🎯",
};

/**
 * The plan, built from the placement gaps AND the questionnaire answers.
 *
 * It generates on arrival rather than behind a button. This is the last screen
 * of onboarding, the learner has just answered eleven questions about
 * themselves, and asking them to press one more thing to find out what it was
 * all for is how a setup flow ends in a shrug.
 *
 * A stored plan is shown immediately and never regenerated — it cost a model
 * call to make, and a plan that reshuffles every time you look at it is not a
 * plan.
 */
export function LearningPlanCard({ initial }: { initial: LearningPlan | null }) {
  const [plan, setPlan] = useState<LearningPlan | null>(initial);
  const [state, setState] = useState<"idle" | "loading" | "off">(
    initial ? "idle" : "loading"
  );

  useEffect(() => {
    if (initial) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/ai/plan", { method: "POST" });
        if (!alive) return;
        if (!res.ok) return setState("off");
        setPlan(await res.json());
        setState("idle");
      } catch {
        if (alive) setState("off");
      }
    })();
    return () => {
      alive = false;
    };
  }, [initial]);

  if (state === "loading") {
    return (
      <div className="card p-6 text-center">
        <p className="text-sm text-ink-soft">
          A Sandra está a montar o teu plano…
        </p>
      </div>
    );
  }

  // No plan is not an error worth showing: the course itself is still there,
  // and the caller renders the normal first-unit card underneath.
  if (!plan || plan.steps.length === 0) return null;

  return (
    <div className="card space-y-3 p-5 text-left">
      <div>
        <h2 className="font-display text-lg font-semibold">🗺️ O teu plano</h2>
        <p className="mt-1 text-sm text-ink-soft">{plan.introEn}</p>
      </div>

      <ol className="space-y-2">
        {plan.steps.map((step, i) => (
          <li key={i}>
            <Link
              href={planHref(step)}
              className="group flex items-start gap-3 rounded-xl border border-sand bg-white/70 px-3 py-2.5 transition-colors hover:border-sage hover:bg-sage-pale/40"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-cream text-sm font-semibold tabular-nums">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium group-hover:text-olive">
                  {KIND_EMOJI[step.kind] ?? "•"} {step.titlePt}
                </span>
                <span className="block text-xs text-ink-soft">{step.whyEn}</span>
              </span>
              <span className="self-center text-ink-faint" aria-hidden>
                ›
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <p className="text-2xs text-ink-faint">
        Feito a partir do teu teste e das tuas respostas. Não é uma prisão —
        podes saltar para qualquer lado quando quiseres.
      </p>
    </div>
  );
}
