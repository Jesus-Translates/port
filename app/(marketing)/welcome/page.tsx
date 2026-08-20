import type { Metadata } from "next";
import Link from "next/link";
import ciple from "@/content/syllabus-ciple.json";
import {
  MAX_SEATS,
  annualEur,
  annualMonths,
  annualSavingEur,
  extraSeatEur,
  formatPlanPrice,
  guaranteeDays,
  plans,
  proTiers,
} from "@/lib/plans";
import { lintPt } from "@/lib/pt-lint";
import { VERBS } from "@/lib/verbs";

/**
 * The shop window — the only public, indexable page in the app.
 *
 * Everything behind the session wall stays noindex (app/layout.tsx); this page
 * alone overrides that, because it is the one page a stranger is supposed to
 * find. It is written in ENGLISH on purpose: the buyer is an English-speaking
 * family living in Portugal, and nobody has opted into immersion yet.
 *
 * Signed-out traffic to "/" is rewritten here by proxy.ts, so the canonical
 * URL is the naked domain rather than /welcome.
 */

export const metadata: Metadata = {
  title: "European Portuguese for your family",
  description:
    "The European Portuguese app for families living in Portugal. Sandra the AI tutor, CIPLE A2 exam prep, native pt-PT voices — and a Brazilianism linter that keeps every lesson honestly European.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    title: "Português — European Portuguese for your family",
    description:
      "European Portuguese, enforced in code: a Brazilianism linter on every lesson, hand-checked pt-PT verb tables, native voices, CIPLE exam prep — one plan for the whole household.",
    type: "website",
    url: "/",
  },
};

/*
 * A deliberately Brazilian paragraph. The pairs shown in the proof section are
 * NOT copywriting — they are lintPt's live output on this exact string, at
 * render time, so the page can never advertise a catch the linter would not
 * actually make. If the rules change, the shop window follows.
 */
const DRIFTED_SAMPLE =
  "Peguei o ônibus depois do café da manhã e agora estou falando com você no celular. O banheiro fica ali.";

/** English blurbs for the plan cards — prices and seat counts stay live data. */
const PLAN_EN: Record<string, string> = {
  individual:
    "One learner, everything included — Sandra, the full course, games and review.",
  family:
    "The whole house on one bill, each person with their own course at their own level.",
};

export default function WelcomePage() {
  const findings = lintPt(DRIFTED_SAMPLE);
  const allPlans = plans();
  const familyPlan = allPlans.find((p) => p.id === "family");
  const days = guaranteeDays();
  const tiers = proTiers();

  return (
    <div className="min-h-dvh bg-paper">
      {/* ————— Hero: the azulejo band, full-bleed ————— */}
      <header className="azulejo rounded-b-[28px] text-paper">
        <div className="mx-auto max-w-5xl px-5 pt-[calc(env(safe-area-inset-top)+22px)] pb-12 sm:pb-16">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-semibold tracking-tight">
              Português
            </span>
            <Link
              href="/login"
              className="rounded-xl border-[1.5px] border-paper/30 px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-paper/15"
            >
              Sign in
            </Link>
          </div>

          <div className="mt-10 max-w-2xl sm:mt-14">
            <p className="text-2xs font-semibold tracking-[.06em] text-paper/85 uppercase">
              European Portuguese · for families living in Portugal
            </p>
            <h1 className="mt-2 font-display text-4xl leading-tight font-semibold tracking-[-.015em] sm:text-5xl">
              Learn the Portuguese your neighbours actually speak.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-paper/85 sm:text-base">
              Most language apps teach Brazilian Portuguese and hope you will
              not notice. This one is built the other way up: European
              Portuguese — <em>pequeno-almoço</em>, <em>autocarro</em>,{" "}
              <em>estou a falar</em> — enforced by code on every lesson, for
              every seat in your house.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/registar"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-paper px-6 text-[15px] font-semibold text-olive transition-opacity hover:opacity-90"
              >
                Create your account →
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border-[1.5px] border-paper/30 px-5 text-[15px] font-medium text-paper transition-colors hover:bg-paper/15"
              >
                I already have an account
              </Link>
            </div>
            {familyPlan ? (
              <p className="mt-4 text-[13px] text-paper/85">
                {familyPlan.namePt}: {formatPlanPrice(familyPlan.eur)} a month
                for up to {familyPlan.seats} people · {days}-day money-back
                guarantee
              </p>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-20 px-5 py-14 sm:py-20">
        {/* ————— The wedge, proven ————— */}
        <section>
          <p className="label">The difference</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Every app promises the right Portuguese. This one enforces it.
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
            AI models are trained on far more Brazilian than European
            Portuguese, so they drift — and they drift on exactly the everyday
            words you will repeat in a shop. Here, every generated lesson is
            checked by a deterministic Brazilianism linter and rewritten before
            you ever see it. Below is the linter running on a drifted sentence,
            live on this page — not a mock-up.
          </p>

          <div className="card mt-6 overflow-hidden">
            <div className="border-b border-sand bg-cream/60 px-5 py-4">
              <p className="text-2xs font-semibold tracking-[.06em] text-ink-soft uppercase">
                What a drifted model writes
              </p>
              <p className="mt-1 font-display text-[17px] leading-relaxed">
                “{DRIFTED_SAMPLE}”
              </p>
            </div>
            <ul className="divide-y divide-sand/70">
              {findings.map((f) => (
                <li
                  key={f.found}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-3"
                >
                  <span className="font-medium text-terra-dark line-through decoration-terra/60">
                    {f.found}
                  </span>
                  <span aria-hidden className="text-ink-faint">
                    →
                  </span>
                  <span className="font-semibold text-olive">{f.expected}</span>
                  <span className="text-xs text-ink-faint">{f.note}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              {
                title: "A Brazilianism linter on every lesson",
                body: "Dozens of high-confidence rules — vocabulary, the Brazilian gerund, pronoun placement — scan each generation. When something drifts, it is corrected before it reaches you.",
              },
              {
                title: "A style contract in every prompt",
                body: "Estar a + infinitive, clitics after the verb, the tu register, post-AO90 spelling — written into every single AI instruction, then verified by the linter anyway.",
              },
              {
                title: `${VERBS.length} hand-checked verb tables`,
                body: (
                  <>
                    European forms throughout — <em>falámos</em>, not{" "}
                    <em>falamos</em> — with audio, flashcards and a trainer that
                    lets you drill any slice of them.
                  </>
                ),
              },
              {
                title: "Native pt-PT voices",
                body: "Dialogues, dictation and stories are voiced with European Portuguese neural voices, at real speed — the Portuguese your ear will actually meet.",
              },
            ].map((c) => (
              <div key={c.title} className="card p-5">
                <h3 className="font-display text-lg font-semibold">{c.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ————— What's inside ————— */}
        <section>
          <p className="label">Inside the hub</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            A tutor, a course, and the practice that makes it stick.
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                emoji: "💬",
                title: "Sandra, your tutor",
                body: "Chat or speak out loud. She explains in English, corrects in pt-PT, and is honest without ever being cold about it.",
              },
              {
                emoji: "📚",
                title: "A real course",
                body: "Units from A1 to B2 — one teaching point each, explained properly, then a short path of practice.",
              },
              {
                emoji: "🔁",
                title: "Spaced repetition",
                body: "Your mistakes from homework, quizzes and games become flashcards that come back right before you would forget them.",
              },
              {
                emoji: "🎧",
                title: "Listening at real speed",
                body: "Two-voice dialogues with tap-to-replay transcripts, plus dictation and hands-free sessions for the car.",
              },
              {
                emoji: "📕",
                title: "Stories set where you live",
                body: "Serialized chapters at your level — the beach, the mercado, the neighbours — with audio and questions.",
              },
              {
                emoji: "🎲",
                title: "Six quick games",
                body: "Gender, word order, verb forms, odd-one-out — two minutes each, on any topic you type in.",
              },
              {
                emoji: "🗺️",
                title: "Missions on the street",
                body: "Real errands. Rehearse at the kitchen table, then go do it — Portuguese sticks out there, not in here.",
              },
              {
                emoji: "✍️",
                title: "Homework, corrected",
                body: "Sandra sets it and marks it with kind, specific feedback — and the family can see the board.",
              },
            ].map((f) => (
              <div key={f.title} className="card p-5">
                <div className="text-2xl" aria-hidden>
                  {f.emoji}
                </div>
                <h3 className="mt-2 font-display text-[17px] font-semibold">
                  {f.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ————— CIPLE ————— */}
        <section className="rounded-[28px] bg-azul-pale p-6 sm:p-10">
          <p className="mb-1.5 block text-xs font-semibold tracking-wide text-azul uppercase">
            The exam that matters
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            A2 is the level Portugal asks for. CIPLE is the exam.
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
            {/*
              NARROWED DELIBERATELY. This used to say "permanent residency or
              citizenship". The citizenship half is well established; the
              residency half was never sourced, and Portuguese immigration law
              moved recently enough (AIMA replacing SEF, the 2025 nationality
              changes) that an unsourced claim here is a liability rather than
              a selling point. People read this while making immigration
              decisions, and a prospective buyer in Portugal will know the
              rules better than this page does. Do not widen it again without
              a current AIMA/IRN source.
            */}
            Portuguese nationality requires proving A2 Portuguese — for most
            people, that means passing CIPLE. The hub
            ships a {ciple.length}-unit preparation track built around the exam
            itself: its three components and their 45 / 30 / 25 weighting, the
            four reading task types, the two timed written texts, the paired
            oral — down to a full timed simulacro and a plan for exam week.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              "How the exam works",
              "Reading & writing, timed",
              "Listening to Portugal's Portuguese",
              "The paired oral",
              "A full simulacro",
              "Exam week",
            ].map((c) => (
              <span key={c} className="chip bg-white/70 text-azul">
                {c}
              </span>
            ))}
          </div>
        </section>

        {/* ————— Family ————— */}
        <section>
          <p className="label">Built for a household</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            One house. One board. Everyone at their own level.
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
            Every seat gets its own placement, its own course and its own review
            deck — a beginner and a B1 speaker can live on the same plan without
            slowing each other down. What you share is the board: family
            quizzes, shared study notes, everyone&apos;s homework, and a weekly
            household league for whoever likes to win at the dinner table.
          </p>
        </section>

        {/* ————— Pricing ————— */}
        <section id="precos">
          <p className="label">Pricing</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Two plans. Flat numbers. No surprises.
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {allPlans.map((p) => (
              <div
                key={p.id}
                className={`card p-6 ${
                  p.id === "family" ? "border-sage ring-1 ring-sage-light" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-semibold">
                    {p.namePt}
                  </h3>
                  {p.id === "family" ? (
                    <span className="chip">most families</span>
                  ) : null}
                </div>
                <p className="mt-3">
                  <span className="font-display text-4xl font-semibold">
                    {formatPlanPrice(p.eur)}
                  </span>
                  <span className="text-sm text-ink-soft"> / month</span>
                </p>
                <p className="mt-1 text-sm font-medium text-ink-soft">
                  {p.seats === 1 ? "1 seat" : `${p.seats} seats included`}
                </p>
                {/* The yearly figure, not just the offer. "Twelve for the
                    price of eleven" is a claim; the price and the saving are
                    what somebody actually weighs. */}
                {annualMonths() < 12 ? (
                  <p className="mt-1 text-sm text-ink-faint">
                    or {formatPlanPrice(annualEur(p.eur))} / year — save{" "}
                    {formatPlanPrice(annualSavingEur(p.eur))}
                  </p>
                ) : null}
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {PLAN_EN[p.id] ?? p.blurbPt}
                </p>
                <Link
                  href="/registar"
                  className={`${
                    p.id === "family" ? "btn-primary" : "btn-ghost"
                  } mt-5 w-full`}
                >
                  Create your account →
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1.5 text-sm text-ink-soft">
            <p>
              A bigger household? Add seats for{" "}
              {formatPlanPrice(extraSeatEur())} each per month, up to{" "}
              {MAX_SEATS} people.
            </p>
            {annualMonths() < 12 ? (
              <p>
                Prefer to pay yearly? Twelve months for the price of{" "}
                {annualMonths()}.
              </p>
            ) : null}
            {tiers.length > 0 ? (
              <p className="text-ink-faint">
                When someone needs more Sandra — say, the month before the exam
                — any seat can add{" "}
                {tiers
                  .map(
                    (t) =>
                      `${t.namePt} (${formatPlanPrice(t.eur)}/month, ${t.multiplier}× the conversations)`
                  )
                  .join(" or ")}
                .
              </p>
            ) : null}
          </div>
        </section>

        {/* ————— Guarantee + final CTA ————— */}
        <section className="card p-6 text-center sm:p-10">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            No free tier. A real guarantee instead.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
            Your subscription starts on day one — and for {days} days,
            &ldquo;this is not for us&rdquo; is all it takes to get every cent
            back. No questions, no forms, no retention call.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/registar" className="btn-primary px-6">
              Create your account →
            </Link>
            <Link href="/login" className="btn-ghost px-5">
              Sign in
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-sand">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-sm text-ink-faint">
          <p>
            <span className="font-display font-semibold text-ink-soft">
              Português
            </span>{" "}
            · European Portuguese for families in Portugal
          </p>
          <p className="flex gap-4">
            <Link href="/registar" className="hover:text-olive">
              Create your account
            </Link>
            <Link href="/login" className="hover:text-olive">
              Sign in
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
