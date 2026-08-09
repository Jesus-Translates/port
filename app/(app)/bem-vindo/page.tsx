import Link from "next/link";
import { PlaceForm } from "@/components/place-form";
import { PlacementQuiz } from "@/components/placement-quiz";
import { LearningQuestionnaire } from "@/components/learning-questionnaire";
import { requireSession } from "@/lib/auth";
import { getMyCefr, getMyPlace, getMyPrefs } from "@/lib/actions/profile";
import { onboardingState } from "@/lib/onboarding";
import { getCourseProgress } from "@/lib/actions/course";

export const metadata = { title: "Bem-vindo" };

const STEP_TITLE: Record<string, { pt: string; en: string }> = {
  place: { pt: "Onde vives?", en: "So your lessons happen where you do." },
  level: { pt: "Que português já sabes?", en: "Sixteen questions. No preparation, no marks." },
  prefs: { pt: "Como gostas de aprender?", en: "Five taps. It shapes what comes first." },
};

export default async function WelcomePage() {
  const session = await requireSession();
  const state = await onboardingState(session.username);

  // Everything the current step needs; each child saves and refreshes, and the
  // page recomputes the step server-side, so the flow advances by itself.
  const [place, level, prefs, course] = await Promise.all([
    getMyPlace(),
    getMyCefr(),
    getMyPrefs(),
    state.done ? getCourseProgress().catch(() => null) : Promise.resolve(null),
  ]);

  if (state.done) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-6 text-center">
        <div className="text-5xl" aria-hidden>
          🎉
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Tudo pronto, {session.displayName}!
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Nível <strong>{level}</strong>
            {place.locality ? ` · ${place.locality}` : ""} — o teu curso está à
            tua espera.
          </p>
        </div>

        {course?.next ? (
          <div className="card p-5 text-left">
            <p className="text-xs tracking-widest text-ink-faint uppercase">
              A tua primeira unidade
            </p>
            <p className="mt-1 font-display text-xl font-semibold">
              {course.next.title}
            </p>
            {course.next.titlePt ? (
              <p className="text-sm text-ink-soft">{course.next.titlePt}</p>
            ) : null}
            <p className="mt-2 text-xs text-ink-faint">
              {course.unitsTotal} unidades em {level}, uma de cada vez.
            </p>
            <Link
              href={`/unidades/${course.next.slug}`}
              className="btn-primary mt-4 w-full"
            >
              Começar →
            </Link>
          </div>
        ) : (
          <Link href="/" className="btn-primary">
            Ir para o início →
          </Link>
        )}

        <Link href="/" className="block text-xs text-ink-soft hover:text-olive">
          ou vai para o início
        </Link>
      </div>
    );
  }

  const copy = STEP_TITLE[state.step];

  return (
    <div className="mx-auto max-w-lg space-y-5 py-4">
      <header>
        <div className="flex items-center gap-2">
          {Array.from({ length: state.total }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i < state.index ? "bg-olive" : "bg-sand"
              }`}
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          Passo {state.index} de {state.total}
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">
          {copy.pt}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">{copy.en}</p>
      </header>

      {state.step === "place" && <PlaceForm initial={place} />}
      {state.step === "level" && <PlacementQuiz savedLevel={level} />}
      {state.step === "prefs" && <LearningQuestionnaire initial={prefs} />}

      {/* Never a trap: someone can leave and finish later. */}
      <p className="text-center">
        <Link href="/" className="text-xs text-ink-soft hover:text-olive">
          Faço isto mais tarde
        </Link>
      </p>
    </div>
  );
}
