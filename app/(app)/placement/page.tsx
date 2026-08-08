import { PlacementQuiz } from "@/components/placement-quiz";
import { PlaceForm } from "@/components/place-form";
import { requireSession } from "@/lib/auth";
import { getMyCefr, getMyPlace } from "@/lib/actions/profile";

export const metadata = { title: "Nível" };

export default async function PlacementPage() {
  await requireSession();
  const [level, place] = await Promise.all([getMyCefr(), getMyPlace()]);

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

      <p className="text-xs text-ink-faint">
        Sixteen hand-written questions, no AI involved — grammar, everyday
        vocabulary and one idiom, all in the Portuguese spoken here.
      </p>
    </div>
  );
}
