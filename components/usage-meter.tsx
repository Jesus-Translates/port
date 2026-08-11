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
  if (b.exempt || !Number.isFinite(b.budgetEur)) return null;

  const heavy = b.pct >= 80;
  const spent = b.blocked !== null;

  return (
    <section className="card space-y-3 p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-semibold">Uso da IA este mês</h2>
        <span
          className={cn(
            "text-sm font-medium tabular-nums",
            spent ? "text-terra-dark" : heavy ? "text-terra" : "text-ink-soft"
          )}
        >
          {b.pct}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-cream">
        <div
          className={cn(
            "h-2 rounded-full transition-[width]",
            spent ? "bg-terra" : heavy ? "bg-terra-light" : "bg-olive"
          )}
          style={{ width: `${Math.min(100, b.pct)}%` }}
        />
      </div>

      {spent ? (
        <p className="rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">
          {b.blocked === "month"
            ? "Usaram a IA incluída neste mês. A Sandra volta no dia 1."
            : "Já usaram bastante IA hoje. A Sandra volta amanhã."}{" "}
          As revisões, o vocabulário, os exercícios e o áudio já gravado
          continuam a funcionar normalmente.
        </p>
      ) : heavy ? (
        <p className="text-sm text-ink-soft">
          Estão a usar bastante — o que é ótimo. Se chegarem aos 100%, a Sandra
          faz uma pausa até ao início do mês e o resto da app continua a
          funcionar.
        </p>
      ) : (
        <p className="text-sm text-ink-soft">
          Inclui as conversas com a Sandra, as correções e o áudio novo. Só
          famílias que falam com a Sandra todos os dias, o dia inteiro, chegam
          perto do limite.
        </p>
      )}
    </section>
  );
}
