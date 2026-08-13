import { budgetState } from "@/lib/budget";
import { cn } from "@/lib/utils";

/**
 * How much of this month's AI allowance the household has used.
 *
 * Deliberately shown as a PERCENTAGE, never in euros. The family pays a flat
 * price; telling them that Sandra has cost 4,12 € so far invites exactly the
 * thought the flat price exists to prevent — "am I being metered?" — and turns
 * every conversation into a purchase decision. What they need to know is
 * whether they are near the edge, and they only ever are if they are using the
 * app extraordinarily hard.
 *
 * It exists at all because hitting an invisible limit is what makes a fair-use
 * policy feel like a bait and switch. A bar that has sat at 12% all month is
 * the best possible argument that the limit is not aimed at them.
 */
export async function UsageMeter() {
  const b = await budgetState();
  if (b.exempt || !Number.isFinite(b.weekBudgetEur)) return null;

  const spent = b.blocked !== null;

  return (
    <section className="card space-y-3 p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-semibold">
          A tua IA esta semana{b.pro ? " · Pro" : ""}
        </h2>
        <span
          className={cn(
            "text-sm font-medium tabular-nums",
            spent ? "text-terra-dark" : b.nearLimit ? "text-terra" : "text-ink-soft"
          )}
        >
          {b.weekPct}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-cream">
        <div
          className={cn(
            "h-2 rounded-full transition-[width]",
            spent ? "bg-terra" : b.nearLimit ? "bg-terra-light" : "bg-olive"
          )}
          style={{ width: `${Math.min(100, b.weekPct)}%` }}
        />
      </div>

      {spent ? (
        <p className="rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">
          {b.blocked === "month"
            ? "A família usou a IA incluída neste mês. Renova no dia 1."
            : b.daysToReset === 1
              ? "Usaste a tua IA desta semana. Renova amanhã."
              : `Usaste a tua IA desta semana. Renova segunda-feira — faltam ${b.daysToReset} dias.`}{" "}
          As revisões, o vocabulário, os exercícios e o áudio já gravado
          continuam a funcionar.
        </p>
      ) : b.nearLimit ? (
        /* 75%, not 100%. A limit you meet without warning feels like a fault
           in the app; one you saw coming feels like a rule. */
        <p className="rounded-xl bg-terra-pale/60 px-3 py-2 text-sm text-terra-dark">
          Estás perto do limite desta semana. Renova{" "}
          {b.daysToReset === 1 ? "amanhã" : `daqui a ${b.daysToReset} dias`}. Se
          desligares a voz da Sandra, cada resposta fica muito mais barata.
        </p>
      ) : (
        <p className="text-sm text-ink-soft">
          É o teu limite, não o da família — ninguém gasta o dos outros. Conta
          conversas com a Sandra e áudio novo; as revisões e os exercícios são
          à parte.
        </p>
      )}
    </section>
  );
}
