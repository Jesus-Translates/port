"use client";

import { useState, useTransition } from "react";
import { setHouseholdSettings } from "@/lib/actions/household-settings";
import type { HouseholdSettings } from "@/lib/household";
import { cn } from "@/lib/utils";

/**
 * How this family wants the app to speak to it.
 *
 * Both are household decisions rather than personal ones — a parent turning
 * immersion on for a nine-year-old, or turning English glosses on because two
 * of the three learners are beginners — so any owner or parent can set them
 * and a child cannot.
 */
export function FamilySettings({
  initial,
  canEdit,
}: {
  initial: HouseholdSettings;
  /** Owner or parent. Children see the settings, greyed, and why. */
  canEdit: boolean;
}) {
  const [settings, setSettings] = useState(initial);
  const [busy, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function update(patch: Partial<HouseholdSettings>) {
    if (!canEdit || busy) return;
    const prev = settings;
    setSettings({ ...settings, ...patch }); // optimistic: switches must move
    setError(null);
    start(async () => {
      const r = await setHouseholdSettings(patch).catch(() => ({
        ok: false,
        error: "Não deu.",
      }));
      if (!r.ok) {
        setSettings(prev);
        setError(r.error ?? "Não deu.");
      }
    });
  }

  return (
    <section className="space-y-2">
      <p className="label">A casa</p>
      <div className="card divide-y divide-cream overflow-hidden">
        <Row
          title="Imersão total"
          sub={
            settings.immersion === "total"
              ? "A Sandra só fala português com toda a família."
              : "A Sandra explica em inglês quando é preciso."
          }
          on={settings.immersion === "total"}
          disabled={!canEdit || busy}
          onToggle={(on) => update({ immersion: on ? "total" : "ajuda" })}
        />
        <Row
          title="Inglês ao lado"
          sub={
            settings.bilingual
              ? "Os botões e as explicações mostram inglês por baixo."
              : "Só português na interface."
          }
          on={settings.bilingual}
          disabled={!canEdit || busy}
          onToggle={(on) => update({ bilingual: on })}
        />
      </div>

      {error ? (
        <p className="rounded-lg bg-terra-pale px-3 py-2 text-sm text-terra-dark">
          {error}
        </p>
      ) : null}

      <p className="text-2xs text-ink-faint">
        {canEdit
          ? "Vale para toda a família. Cada pessoa pode escolher a sua própria imersão em Perfil."
          : "Só um adulto da família pode mudar isto."}
      </p>
    </section>
  );
}

function Row({
  title,
  sub,
  on,
  disabled,
  onToggle,
}: {
  title: string;
  sub: string;
  on: boolean;
  disabled: boolean;
  onToggle: (on: boolean) => void;
}) {
  return (
    <div className="flex min-h-14 items-center gap-3 px-4 py-3.5">
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-medium">{title}</span>
        <span className="block text-xs text-ink-faint">{sub}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={title}
        disabled={disabled}
        onClick={() => onToggle(!on)}
        className={cn(
          "tap-44 flex h-7 w-[46px] shrink-0 items-center rounded-full p-[3px] transition-colors disabled:opacity-40",
          on ? "justify-end bg-olive" : "justify-start bg-sand"
        )}
      >
        <span className="size-[22px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.2)]" />
      </button>
    </div>
  );
}
