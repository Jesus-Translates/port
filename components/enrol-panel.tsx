"use client";

import { useState, useTransition } from "react";
import { enrolCategory } from "@/lib/actions/review";
import { cn } from "@/lib/utils";

type Cat = {
  id: number;
  namePt: string;
  emoji: string;
  enrolled: number;
  total: number;
};

export function EnrolPanel({
  byCategory,
  deckTotal,
  due,
}: {
  byCategory: Cat[];
  deckTotal: number;
  due: number;
}) {
  const [open, setOpen] = useState(deckTotal === 0);
  const [pending, startTransition] = useTransition();
  const allEnrolled = byCategory.every((c) => c.enrolled >= c.total);

  return (
    <section className="card p-4">
      <button
        className="flex w-full items-center justify-between"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="font-semibold">
          📖 O teu baralho — {deckTotal} cartões
          {due > 0 ? ` · ${due} para rever` : ""}
        </span>
        <span className="text-ink-faint">{open ? "▴" : "▾"}</span>
      </button>

      {open ? (
        <div className="mt-3 space-y-3">
          <p className="text-xs text-ink-soft">
            New cards enter at ~20/day so nobody drowns. Mistakes from homework
            and quizzes add themselves.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {byCategory.map((c) => {
              const full = c.enrolled >= c.total && c.total > 0;
              return (
                <button
                  key={c.id}
                  disabled={pending || full}
                  onClick={() =>
                    startTransition(async () => {
                      await enrolCategory(c.id);
                    })
                  }
                  className={cn(
                    "rounded-xl border px-2 py-2 text-left text-xs transition-colors",
                    full
                      ? "border-sage bg-sage-pale/60 text-olive"
                      : "border-sand bg-white/70 hover:border-sage hover:bg-sage-pale"
                  )}
                >
                  <span aria-hidden>{c.emoji}</span>{" "}
                  <span className="font-medium">{c.namePt}</span>
                  <div className="mt-0.5 text-[10px] text-ink-faint">
                    {full ? "no baralho ✓" : `${c.enrolled}/${c.total}`}
                  </div>
                </button>
              );
            })}
          </div>
          {!allEnrolled ? (
            <button
              className="btn-ghost w-full"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await enrolCategory(null);
                })
              }
            >
              {pending ? "A adicionar…" : "Adicionar o livro inteiro"}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
