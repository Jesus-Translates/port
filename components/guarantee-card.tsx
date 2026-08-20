"use client";

import { useState, useTransition } from "react";
import { Bi } from "@/components/bilingual";
import { requestRefund } from "@/lib/actions/billing";

/**
 * The money-back guarantee, while it is still claimable.
 *
 * Shown as a promise with a real deadline rather than a line of marketing:
 * the date comes from the subscription row, so what the family reads here is
 * the same value requestRefund() enforces. A guarantee whose deadline lives
 * only on a landing page is a guarantee nobody can hold you to, which is
 * exactly why customers discount them.
 *
 * Claiming is one click and asks no questions. Making somebody justify
 * themselves to get their own money back converts worse than having no
 * guarantee at all, because the friction is what they were afraid of.
 */
export function GuaranteeCard({
  daysLeft,
  endsOn,
  requested,
  canManage,
}: {
  daysLeft: number;
  endsOn: string;
  requested: boolean;
  canManage: boolean;
}) {
  const [done, setDone] = useState(requested);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();

  if (done) {
    return (
      <section className="card space-y-2 p-5">
        <h2 className="font-semibold">💶 Devolução pedida</h2>
        <p className="text-sm text-ink-soft">
          Recebemos o pedido e vamos devolver o valor completo. Não é preciso
          fazer mais nada — se quiseres contar o que não resultou, lemos tudo.
        </p>
      </section>
    );
  }

  return (
    <section className="card space-y-3 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-semibold">🛡️ Garantia de devolução</h2>
        <span className="chip bg-sage-pale text-olive">
          {daysLeft} {daysLeft === 1 ? "dia" : "dias"}
        </span>
      </div>
      <p className="text-sm text-ink-soft">
        Se isto não for para vocês, devolvemos tudo até {endsOn}. Sem perguntas
        e sem ter de justificar nada.
      </p>

      {error ? (
        <p className="rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">
          {error}
        </p>
      ) : null}

      {canManage ? (
        confirming ? (
          <div className="space-y-2">
            <p className="text-sm text-ink-soft">
              Queres mesmo? Devolvemos o valor completo.
            </p>
            <div className="flex gap-2">
              <button
                className="btn-terra flex-1"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const r = await requestRefund();
                    if (r.ok) setDone(true);
                    else {
                      setError(r.error);
                      setConfirming(false);
                    }
                  })
                }
              >
                {pending ? (
                  <Bi pt="A pedir…" en="Requesting…" inline />
                ) : (
                  <Bi pt="Sim, quero a devolução" en="Yes, I want the refund" inline />
                )}
              </button>
              <button
                className="btn-ghost"
                disabled={pending}
                onClick={() => setConfirming(false)}
              >
                <Bi pt="Ficar" en="Stay" inline />
              </button>
            </div>
          </div>
        ) : (
          /* Low emphasis on purpose. It has to be findable and honest, not
             the loudest thing on the page. */
          <button
            className="text-xs text-ink-faint underline underline-offset-2 hover:text-terra-dark"
            onClick={() => setConfirming(true)}
          >
            <Bi pt="Pedir a devolução" en="Request the refund" inline />
          </button>
        )
      ) : null}
    </section>
  );
}
