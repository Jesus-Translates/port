import { PlacementQuiz } from "@/components/placement-quiz";
import { requireSession } from "@/lib/auth";
import { getMyCefr } from "@/lib/actions/profile";

export const metadata = { title: "Nível" };

export default async function PlacementPage() {
  await requireSession();
  const level = await getMyCefr();

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

      <PlacementQuiz savedLevel={level} />

      <p className="text-xs text-ink-faint">
        Sixteen hand-written questions, no AI involved — grammar, everyday
        vocabulary and one idiom, all in the Portuguese spoken here.
      </p>
    </div>
  );
}
