"use client";

import { useState, useTransition } from "react";
import { clearSeatAddon, grantSeatAddon, type SeatAddon } from "@/lib/actions/billing";
import type { ProTier } from "@/lib/plans";
import { cn } from "@/lib/utils";

/**
 * The per-seat AI add-ons.
 *
 * Per SEAT, not per household — a family buys it for the adult sitting the
 * CIPLE exam, not for the six-year-old, and that is the only reason €19 is a
 * sentence anyone finishes. The card says so out loud, because a family that
 * reads "€19" against a "€5 seat" and stops there has drawn the wrong
 * comparison: the right one is a tutor hour, which costs about the same and
 * happens once.
 *
 * There is no checkout yet, and this does not pretend otherwise. Buttons that
 * take money are absent rather than dead — the operator can grant an add-on to
 * test the entitlement end to end, and everyone else is told plainly that it
 * is coming. A dead "Subscribe" is worse than an honest gap.
 */
export function SeatAddons({
  seats,
  tiers,
  canManage,
  isOperator,
}: {
  seats: SeatAddon[];
  /*
   * Prices arrive already FORMATTED.
   *
   * The formatter is a function, and a function cannot cross the server/client
   * boundary — only serialisable data and server actions can. Passing
   * formatPlanPrice as a prop typechecked, built locally (this page is dynamic
   * and never prerendered), and broke the deploy. Strings cross; functions do
   * not.
   */
  tiers: (ProTier & { priceLabel: string })[];
  canManage: boolean;
  isOperator: boolean;
}) {
  const [rows, setRows] = useState(seats);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function grant(username: string, tier: ProTier) {
    setError(null);
    start(async () => {
      const r = await grantSeatAddon(username, tier.id);
      if (r.ok) {
        setRows((list) =>
          list.map((s) =>
            s.username === username
              ? { ...s, tierId: tier.id, tierName: tier.namePt, multiplier: tier.multiplier, untilOn: "fim do mês" }
              : s
          )
        );
      } else setError(r.error);
    });
  }

  function clear(username: string) {
    setError(null);
    start(async () => {
      const r = await clearSeatAddon(username);
      if (r.ok) {
        setRows((list) =>
          list.map((s) =>
            s.username === username
              ? { ...s, tierId: null, tierName: null, multiplier: 1, untilOn: null }
              : s
          )
        );
      } else setError(r.error);
    });
  }

  return (
    <section className="card space-y-4 p-5">
      <div>
        <h2 className="font-semibold">⚡ Mais conversa com a Sandra</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Cada pessoa tem o seu limite semanal. Estes extras multiplicam-no — e
          são por pessoa, não pela família toda: podes dar Pro a quem está a
          preparar o exame e deixar os miúdos no normal.
        </p>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {tiers.map((t) => (
          <div key={t.id} className="rounded-xl border border-sand bg-white/70 p-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-display text-lg font-semibold">{t.namePt}</span>
              <span className="chip bg-cream text-ink-soft">{t.multiplier}×</span>
            </div>
            <p className="mt-1 font-display text-xl font-semibold text-olive">
              {t.priceLabel}
              <span className="text-xs font-normal text-ink-faint"> /mês por pessoa</span>
            </p>
            <p className="mt-1.5 text-xs text-ink-soft">{t.blurbPt}</p>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <p className="label">Quem tem extra</p>
        {rows.map((s) => (
          <div
            key={s.username}
            className={cn(
              "flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2 text-sm",
              s.multiplier > 1 ? "border-olive bg-sage-pale/50" : "border-sand bg-white/70"
            )}
          >
            <span className="font-medium capitalize">{s.displayName}</span>
            {s.multiplier > 1 ? (
              <>
                <span className="chip bg-olive text-paper">
                  {s.tierName} · {s.multiplier}×
                </span>
                {s.untilOn ? (
                  <span className="text-2xs text-ink-faint">até {s.untilOn}</span>
                ) : null}
              </>
            ) : (
              <span className="text-xs text-ink-faint">normal</span>
            )}

            <span className="ml-auto flex gap-1.5">
              {isOperator
                ? tiers.map((t) => (
                    <button
                      key={t.id}
                      className="rounded-full border border-sand px-2.5 py-1 text-xs hover:border-sage"
                      disabled={pending || s.tierId === t.id}
                      onClick={() => grant(s.username, t)}
                    >
                      {t.multiplier}×
                    </button>
                  ))
                : null}
              {canManage && s.multiplier > 1 ? (
                <button
                  className="rounded-full border border-sand px-2.5 py-1 text-xs hover:border-terra hover:text-terra-dark"
                  disabled={pending}
                  onClick={() => clear(s.username)}
                >
                  Desativar
                </button>
              ) : null}
            </span>
          </div>
        ))}
      </div>

      {error ? (
        <p className="rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">
          {error}
        </p>
      ) : null}

      {/* No dead buttons. The gap is stated, not decorated. */}
      <p className="text-2xs text-ink-faint">
        {isOperator
          ? "Estás a ver os controlos de operador: ativar aqui não cobra nada, serve para testar. O pagamento entra com o checkout."
          : "Ainda não é possível ativar sozinho — o pagamento está a ser ligado. Fala connosco e ativamos à mão."}{" "}
        Um extra dura até ao fim do mês e não transita.
      </p>
    </section>
  );
}
