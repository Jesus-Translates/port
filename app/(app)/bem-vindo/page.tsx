import Link from "next/link";
import { ZonePicker } from "@/components/zone-picker";
import { PlacementQuiz } from "@/components/placement-quiz";
import { LearningQuestionnaire } from "@/components/learning-questionnaire";
import { FamilyStep } from "@/components/family-step";
import { requireSession } from "@/lib/auth";
import { getMyCefr, getMyPlace, getMyPrefs, getZones } from "@/lib/actions/profile";
import { getBilling } from "@/lib/actions/billing";
import { onboardingState } from "@/lib/onboarding";
import { getCourseProgress } from "@/lib/actions/course";
import { getPlacementRecord } from "@/lib/actions/placement";
import { BLOCK_SIZE } from "@/lib/placement-types";
import { LearningPlanCard } from "@/components/learning-plan";
import { householdMembers } from "@/lib/tenant";

export const metadata = { title: "Bem-vindo" };

const STEP_TITLE: Record<string, { pt: string; en: string }> = {
  place: { pt: "Onde vives?", en: "So your lessons happen where you do." },
  level: { pt: "Que português já sabes?", en: "Ten quick questions. No preparation, no marks." },
  prefs: { pt: "Como gostas de aprender?", en: "Five taps. It shapes what comes first." },
  family: {
    pt: "Quem mais vive cá em casa?",
    en: "Your plan already has their seats — a minute each, or skip it.",
  },
};

export default async function WelcomePage() {
  const session = await requireSession();
  const state = await onboardingState(session.username);

  // Everything the current step needs; each child saves and refreshes, and the
  // page recomputes the step server-side, so the flow advances by itself.
  const [place, level, prefs, zoneList, course] = await Promise.all([
    getMyPlace(),
    getMyCefr(),
    getMyPrefs(),
    getZones(),
    state.done ? getCourseProgress().catch(() => null) : Promise.resolve(null),
  ]);
  // The plan is the payoff for the questionnaire, so it only exists once the
  // questionnaire has been answered.
  const record = state.done ? await getPlacementRecord() : {};

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

        {/* Built from the placement gaps AND the questionnaire answers — the
            two halves of "what to work on" and "how you'll actually do it". */}
        <LearningPlanCard initial={record.plan ?? null} />

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

        {/*
         * Everything above is the celebration; everything below is the same
         * three answers, editable. /placement used to be a second page that
         * stacked these identical components — one surface for "where I live,
         * what level I am, how I learn" is enough.
         */}
        <section className="space-y-5 pt-6 text-left">
          <div className="border-t border-sand pt-6">
            <h2 className="font-display text-lg font-semibold">
              Mudar as tuas respostas
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Mudaste de terra, ou o nível já não encaixa? Muda aqui — vale para
              tudo o que a Sandra escrever a partir de agora.
            </p>
          </div>

          <ZonePicker initial={place} zones={zoneList} />
          <PlacementQuiz savedLevel={level} />

          <div className="space-y-2">
            <h3 className="font-semibold">🧩 Como aprendes melhor?</h3>
            <LearningQuestionnaire initial={prefs} />
          </div>

          <p className="text-2xs text-ink-faint">
            {/* Was "dezasseis perguntas" — the flat test this replaced. It is
                a ladder now, and describing it as a fixed pile of questions
                sets up exactly the wrong expectation before someone starts. */}
            O teste é uma escada: {BLOCK_SIZE} perguntas por nível, escritas à
            mão, sem IA. Começas em A1 e para assim que uma secção te escapar —
            gramática, vocabulário do dia a dia e uma expressão, tudo no
            português daqui.
          </p>
        </section>
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

      {state.step === "place" && (
        <ZonePicker initial={place} zones={zoneList} />
      )}
      {state.step === "level" && <PlacementQuiz savedLevel={level} />}
      {state.step === "prefs" && <LearningQuestionnaire initial={prefs} />}
      {state.step === "family" && <FamilySeats />}

      {/* Never a trap: someone can leave and finish later. */}
      <p className="text-center">
        <Link href="/" className="text-xs text-ink-soft hover:text-olive">
          Faço isto mais tarde
        </Link>
      </p>
    </div>
  );
}

/**
 * The family step's data, fetched only when the step is actually shown — the
 * other three steps should not pay for a billing read. Props down to the
 * client component are plain data; it imports the server actions it calls
 * itself (functions cannot cross the server→client prop boundary).
 *
 * If billing cannot be read the seat numbers degrade to "full", which renders
 * the step as a plain "continue" — degraded but never a dead end.
 */
async function FamilySeats() {
  const [billing, members] = await Promise.all([
    getBilling().catch(() => null),
    householdMembers().catch(() => []),
  ]);
  return (
    <FamilyStep
      seatLimit={billing?.seatLimit ?? 1}
      seatsUsed={billing?.seatsUsed ?? 1}
      members={members}
    />
  );
}
