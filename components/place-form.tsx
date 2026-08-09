"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setMyPlace } from "@/lib/actions/profile";
import type { Place } from "@/lib/place";

/**
 * "Where do you live?" — asked once, before the placement quiz.
 *
 * This is the cheapest quality win in the app: every generated lesson, story,
 * dialogue and homework invents a setting, and knowing the learner's town
 * turns those from generic Portugal into the street they walk down. Answering
 * is two taps, and the town is optional.
 */
export function PlaceForm({
  initial,
  compact = false,
}: {
  initial: Place;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [inPt, setInPt] = useState<boolean | null>(initial.livesInPortugal);
  const [locality, setLocality] = useState(initial.locality ?? "");
  const [saved, setSaved] = useState(false);

  function save(lives: boolean, town: string) {
    setSaved(false);
    start(async () => {
      await setMyPlace(lives, town);
      setSaved(true);
      router.refresh();
    });
  }

  const answered = inPt !== null;

  return (
    <section
      className={
        compact
          ? "rounded-xl border border-line bg-card p-4"
          : "rounded-2xl border border-line bg-card p-5"
      }
    >
      <h2 className="text-sm font-semibold">
        📍 Onde vives? · Where do you live?
      </h2>
      <p className="mt-1 text-xs text-ink-soft">
        Sandra writes your lessons, stories and homework around where you actually
        are — your market, your beach, your bus.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setInPt(true);
            save(true, locality);
          }}
          disabled={pending}
          aria-pressed={inPt === true}
          className={`rounded-lg border px-3 py-2 text-sm transition disabled:opacity-50 ${
            inPt === true
              ? "border-accent bg-accent/10 font-medium text-accent"
              : "border-line hover:border-accent/50"
          }`}
        >
          🇵🇹 Vivo em Portugal
        </button>
        <button
          type="button"
          onClick={() => {
            setInPt(false);
            save(false, locality);
          }}
          disabled={pending}
          aria-pressed={inPt === false}
          className={`rounded-lg border px-3 py-2 text-sm transition disabled:opacity-50 ${
            inPt === false
              ? "border-accent bg-accent/10 font-medium text-accent"
              : "border-line hover:border-accent/50"
          }`}
        >
          🌍 Vivo noutro país
        </button>
      </div>

      {answered && (
        <form
          className="mt-3 flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            save(inPt, locality);
          }}
        >
          <label className="flex-1 min-w-[12rem] text-xs text-ink-soft">
            {inPt
              ? "Em que terra? (ex.: Ericeira, Aveiro, Lisboa)"
              : "Onde vives? (ex.: Austin, Texas)"}
            <input
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              maxLength={80}
              placeholder={inPt ? "Ericeira" : "Austin, Texas"}
              className="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "A guardar…" : "Guardar"}
          </button>
        </form>
      )}

      {saved && !pending && (
        <p className="mt-2 text-xs text-accent">
          Guardado — a partir de agora os exercícios são sobre a tua zona.
        </p>
      )}
    </section>
  );
}
