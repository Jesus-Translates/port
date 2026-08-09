"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setMyPlace, setMyZone, type ZoneOption } from "@/lib/actions/profile";
import type { Place } from "@/lib/place";

/**
 * "Where do you live?" in two taps, then an optional third.
 *
 * Free text was the wrong question. A learner typing "Ericeira" gave us a
 * string we could only hand to a model and hope — and someone typing "perto de
 * Lisboa" or a misspelling gave us nothing. Picking from researched regions
 * means the answer unlocks a paragraph a human actually wrote about that
 * place: its markets, its transport, its food, its accent.
 *
 * The town is deliberately a SEPARATE, skippable question. The region already
 * does most of the work, and plenty of people would rather not say exactly
 * where they live — asking for it as a bonus rather than a requirement is both
 * kinder and gets a better answer rate.
 */
export function ZonePicker({
  initial,
  zones,
}: {
  initial: Place;
  zones: ZoneOption[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [inPt, setInPt] = useState<boolean | null>(initial.livesInPortugal);
  const [zone, setZone] = useState<string | null>(initial.zoneSlug);
  const [abroad, setAbroad] = useState(initial.locality ?? "");
  const [saved, setSaved] = useState(false);

  const chosen = zones.find((z) => z.slug === zone) ?? null;

  function pickZone(slug: string) {
    setZone(slug);
    setSaved(false);
    // Save immediately: the region alone is a complete, useful answer.
    start(async () => {
      await setMyZone(slug, null);
      router.refresh();
    });
  }

  function pickTown(placeSlug: string | null) {
    if (!zone) return;
    setSaved(false);
    start(async () => {
      await setMyZone(zone, placeSlug);
      setSaved(true);
      router.refresh();
    });
  }

  function saveAbroad() {
    setSaved(false);
    start(async () => {
      await setMyPlace(false, abroad);
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <section className="card space-y-4 p-5">
      <div>
        <h2 className="text-sm font-semibold">
          📍 Onde vives? · Where do you live?
        </h2>
        <p className="mt-1 text-xs text-ink-soft">
          Sandra writes your lessons, stories and homework around where you
          actually are — your market, your beach, your bus.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setInPt(true);
            setSaved(false);
          }}
          disabled={pending}
          aria-pressed={inPt === true}
          className={`rounded-lg border px-3 py-2 text-sm transition disabled:opacity-50 ${
            inPt === true
              ? "border-sage bg-sage-pale font-medium text-olive"
              : "border-sand hover:border-sage"
          }`}
        >
          🇵🇹 Vivo em Portugal
        </button>
        <button
          type="button"
          onClick={() => {
            setInPt(false);
            setSaved(false);
          }}
          disabled={pending}
          aria-pressed={inPt === false}
          className={`rounded-lg border px-3 py-2 text-sm transition disabled:opacity-50 ${
            inPt === false
              ? "border-sage bg-sage-pale font-medium text-olive"
              : "border-sand hover:border-sage"
          }`}
        >
          🌍 Vivo noutro país
        </button>
      </div>

      {inPt === true && (
        <div className="space-y-4">
          <div>
            <p className="label">Em que zona?</p>
            {zones.length === 0 ? (
              <p className="text-xs text-ink-faint">
                As zonas ainda não foram carregadas — corre{" "}
                <code>npm run db:zones</code>.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {zones.map((z) => (
                  <button
                    key={z.slug}
                    type="button"
                    onClick={() => pickZone(z.slug)}
                    disabled={pending}
                    aria-pressed={zone === z.slug}
                    className={`rounded-xl border p-3 text-left transition disabled:opacity-60 ${
                      zone === z.slug
                        ? "border-sage bg-sage-pale"
                        : "border-sand bg-white/70 hover:border-sage"
                    }`}
                  >
                    <span className="block font-medium">
                      <span aria-hidden>{z.emoji}</span> {z.namePt}
                    </span>
                    <span className="block text-xs text-ink-soft">
                      {z.nameEn}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {chosen && chosen.places.length > 0 && (
            <div>
              <p className="label">
                Queres dizer onde exatamente? <span className="normal-case font-normal text-ink-faint">· opcional</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {chosen.places.map((p) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => pickTown(p.slug)}
                    disabled={pending}
                    aria-pressed={initial.placeSlug === p.slug}
                    className={`rounded-full border px-3 py-1.5 text-sm transition disabled:opacity-60 ${
                      initial.placeSlug === p.slug
                        ? "border-sage bg-sage-pale font-medium text-olive"
                        : "border-sand bg-white/70 hover:border-sage"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => pickTown(null)}
                  disabled={pending}
                  className="rounded-full border border-sand px-3 py-1.5 text-sm text-ink-soft hover:border-sage disabled:opacity-60"
                >
                  Prefiro não dizer
                </button>
              </div>
              <p className="mt-2 text-xs text-ink-faint">
                A zona já chega. Isto só afina ainda mais os exemplos.
              </p>
            </div>
          )}
        </div>
      )}

      {inPt === false && (
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            saveAbroad();
          }}
        >
          <label className="min-w-[12rem] flex-1 text-xs text-ink-soft">
            Onde vives? (ex.: Austin, Texas)
            <input
              value={abroad}
              onChange={(e) => setAbroad(e.target.value)}
              maxLength={80}
              placeholder="Austin, Texas"
              className="mt-1 w-full rounded-lg border border-sand bg-white/80 px-3 py-2 text-sm text-ink"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-olive px-3 py-2 text-sm font-medium text-paper hover:bg-ink disabled:opacity-50"
          >
            {pending ? "A guardar…" : "Guardar"}
          </button>
        </form>
      )}

      {saved && !pending && (
        <p className="text-xs text-olive">
          Guardado — a partir de agora os exercícios são sobre a tua zona.
        </p>
      )}
    </section>
  );
}
