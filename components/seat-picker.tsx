"use client";

import { useState, useTransition } from "react";
import { setSeats } from "@/lib/actions/billing";
import { cn } from "@/lib/utils";

/**
 * How many people the family pays for, and what that costs.
 *
 * The price updates as you press, before you commit. Seats ARE the price here,
 * so a control that changed the seat count and left you to work out the new
 * bill from a pricing table would be hiding the only thing the control does.
 *
 * The arithmetic is duplicated from lib/plans.ts on purpose — this is a client
 * component and cannot call a server function to render a number sixty times a
 * second. The inputs are passed in from the server so the two can only drift if
 * someone changes the shape of the formula, not its values.
 */
export function SeatPicker({
  seatLimit,
  seatsUsed,
  includedSeats,
  planEur,
  extraSeatEur,
  maxSeats,
  canManage,
}: {
  seatLimit: number;
  seatsUsed: number;
  includedSeats: number;
  planEur: number;
  extraSeatEur: number;
  maxSeats: number;
  canManage: boolean;
}) {
  const [seats, setSeatsLocal] = useState(seatLimit);
  const [saved, setSaved] = useState(seatLimit);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const price = planEur + Math.max(0, seats - includedSeats) * extraSeatEur;
  const money = (v: number) =>
    new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v);

  // Never below the people already in the household — removing a seat must not
  // be a way to orphan somebody's account.
  const floor = Math.max(1, seatsUsed);
  const dirty = seats !== saved;

  function commit() {
    setError(null);
    start(async () => {
      const r = await setSeats(seats);
      if (r.ok) setSaved(r.seatLimit);
      else {
        setError(r.error);
        setSeatsLocal(saved);
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="label">Quantas pessoas</p>
          <p className="text-xs text-ink-faint">
            {includedSeats} incluídas · +{money(extraSeatEur)} por cada pessoa a mais
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Menos uma pessoa"
            disabled={!canManage || pending || seats <= floor}
            onClick={() => setSeatsLocal((n) => Math.max(floor, n - 1))}
            className="tap-44 grid size-10 place-items-center rounded-full border border-sand bg-white/70 text-lg font-semibold disabled:opacity-40 hover:border-sage"
          >
            −
          </button>
          <span className="w-8 text-center font-display text-2xl font-semibold tabular-nums">
            {seats}
          </span>
          <button
            type="button"
            aria-label="Mais uma pessoa"
            disabled={!canManage || pending || seats >= maxSeats}
            onClick={() => setSeatsLocal((n) => Math.min(maxSeats, n + 1))}
            className="tap-44 grid size-10 place-items-center rounded-full border border-sand bg-white/70 text-lg font-semibold disabled:opacity-40 hover:border-sage"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex items-baseline justify-between rounded-xl bg-cream px-3 py-2.5">
        <span className="text-sm text-ink-soft">
          {dirty ? "Passaria a ser" : "Pagam"}
        </span>
        <span
          className={cn(
            "font-display text-2xl font-semibold tabular-nums",
            dirty ? "text-terra-dark" : "text-olive"
          )}
        >
          {money(price)}
          <span className="text-xs font-normal text-ink-faint"> /mês</span>
        </span>
      </div>

      {seats <= seatsUsed && seats === floor ? (
        <p className="text-2xs text-ink-faint">
          Já são {seatsUsed} na família — para pagar menos, remove alguém
          primeiro em Contas.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">
          {error}
        </p>
      ) : null}

      {canManage && dirty ? (
        <div className="flex gap-2">
          <button className="btn-primary flex-1" disabled={pending} onClick={commit}>
            {pending ? "A guardar…" : `Confirmar ${money(price)}/mês`}
          </button>
          <button
            className="btn-ghost"
            disabled={pending}
            onClick={() => {
              setSeatsLocal(saved);
              setError(null);
            }}
          >
            Cancelar
          </button>
        </div>
      ) : null}

      {!canManage ? (
        <p className="text-2xs text-ink-faint">
          Só um adulto da família pode mudar o número de pessoas.
        </p>
      ) : null}
    </div>
  );
}
