import { PlacementQuiz } from "@/components/placement-quiz";
import { PlaceForm } from "@/components/place-form";
import { requireSession } from "@/lib/auth";
import { getMyCefr, getMyPlace, getMyPrefs } from "@/lib/actions/profile";
import { LearningQuestionnaire } from "@/components/learning-questionnaire";

export const metadata = { title: "Nível" };

export default async function PlacementPage() {
  await requireSession();
  const [level, place, prefs] = await Promise.all([
    getMyCefr(),
    getMyPlace(),
    getMyPrefs(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          🧭 Onde estou? · Placement
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          A quick adaptive check of your European Portuguese. The level you save
          becomes the default for new quizzes, lessons and stories — change it
          any time by taking the test again.
        </p>
      </header>

      {/* Asked before the quiz: it takes two taps and it localises every piece
          of content the app generates from here on. */}
      <PlaceForm initial={place} />

      <PlacementQuiz savedLevel={level} />

      {/* After the level, the questions that shape HOW the level gets taught.
          Five taps, and every answer moves a real lever. */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">
          🧩 Como aprendes melhor?
        </h2>
        <p className="text-sm text-ink-soft">
          Five questions, five taps. They decide the order of your activities,
          how many games you get, when speaking shows up, and when your day is
          done.
        </p>
        <LearningQuestionnaire initial={prefs} />
      </section>

      <p className="text-xs text-ink-faint">
        Sixteen hand-written questions, no AI involved — grammar, everyday
        vocabulary and one idiom, all in the Portuguese spoken here.
      </p>
    </div>
  );
}
