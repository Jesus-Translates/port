"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Bi } from "@/components/bilingual";
import { UnitContinue } from "@/components/unit-return";
import { finishLesson } from "@/lib/actions/course";
import type { UnitContext } from "@/lib/unit-context";

/**
 * The end of a lesson.
 *
 * NOTE: "lesson" is not currently one of the course's item kinds, so the unit
 * branch below is inert today — the standalone ending is what a learner
 * actually meets. It is written both ways because the alternative is a lesson
 * that, once it does become a course step, completes nothing.
 *
 * Reading one used to just stop: no button, nothing recorded, no XP, and no
 * way to tell tomorrow whether you had read it. Every other activity in the
 * app ends with something to press, and a screen that quietly runs out is read
 * as "I must have missed a step".
 *
 * Two endings, because there are two ways to arrive:
 *
 *  - From a course step, the unit hand-off is the right one — it ticks the
 *    step off and names the next session, which is the whole flow the course
 *    is built around. UnitContinue already does exactly that.
 *  - On its own, there is no step to tick, so finishing records the reading as
 *    activity: it counts toward the day's goal and keeps a streak alive, the
 *    same way a game or a review session does.
 */
export function LessonFinish({
  unit,
  title,
  topic,
}: {
  unit: UnitContext | null;
  title: string;
  /** Where "keep practising this" should point. */
  topic: string;
}) {
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  // Opened from the course: the step is the record, and it leads somewhere.
  if (unit) return <UnitContinue unit={unit} />;

  if (done) {
    return (
      <div className="card space-y-3 p-4 text-center">
        <p className="font-display text-lg font-semibold text-olive">
          <Bi pt="Lição concluída ✓" en="Lesson finished" inline />
        </p>
        <p className="text-sm text-ink-soft">
          Contou para o teu dia.
          <span className="mt-0.5 block text-ink-faint">
            It counted toward today.
          </span>
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            href={`/practice?topic=${encodeURIComponent(topic)}`}
            className="btn-primary text-sm"
          >
            <Bi pt="Praticar isto 🎯" en="Practice this" inline />
          </Link>
          <Link href="/workbook" className="btn-ghost text-sm">
            <Bi pt="Outras lições" en="More lessons" inline />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <button
      className="btn-primary w-full"
      disabled={pending}
      onClick={() =>
        start(async () => {
          // A failure here must not trap someone on a lesson they have read;
          // the reading happened either way.
          await finishLesson(title).catch(() => {});
          setDone(true);
        })
      }
    >
      {pending ? (
        <Bi pt="A guardar…" en="Saving…" inline />
      ) : (
        <Bi pt="Concluir a lição ✓" en="Finish this lesson" inline />
      )}
    </button>
  );
}
