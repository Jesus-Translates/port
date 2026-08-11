import { requireOperator, requireSession } from "@/lib/auth";
import { avatarFor, titleCase } from "@/lib/people";
import { formatEur, getSpend, getSpendEverywhere, usdToEur } from "@/lib/usage";

export const metadata = { title: "Gastos" };

/**
 * What the AI actually costs to run — an OPERATOR's page.
 *
 * It was open to every signed-in learner, which told a paying family that
 * their conversation with Sandra cost four cents. That invites exactly one
 * thought — "am I being metered?" — when the truth is a flat monthly price.
 * Families see /conta instead: their plan, their seats, their renewal.
 */
export default async function SpendPage() {
  await requireOperator();
  const session = await requireSession();
  const [mine, byUser] = await Promise.all([
    getSpend(session.username),
    // Operator page: the whole instance, not one household.
    getSpendEverywhere(),
  ]);
  const familyTotal = byUser.reduce((sum, u) => sum + u.monthEur, 0);
  const month = new Date().toLocaleDateString("pt-PT", {
    month: "long",
    year: "numeric",
    timeZone: "Europe/Lisbon",
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">💶 Gastos de IA</h1>
        <p className="mt-1 text-sm text-ink-soft">
          What Sandra has actually cost, in euros —{" "}
          <span className="capitalize">{month}</span>.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <div className="text-xs text-ink-soft">O teu gasto este mês</div>
          <div className="mt-1 font-display text-3xl font-bold text-terra">
            {formatEur(mine.monthEur)}
          </div>
          <div className="mt-1 text-xs text-ink-faint">
            {mine.calls} {mine.calls === 1 ? "pedido" : "pedidos"} à Sandra
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-ink-soft">A família este mês</div>
          <div className="mt-1 font-display text-3xl font-bold text-olive">
            {formatEur(familyTotal)}
          </div>
          <div className="mt-1 text-xs text-ink-faint">
            {byUser.length} {byUser.length === 1 ? "pessoa" : "pessoas"} ativas
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-ink-soft">O teu total de sempre</div>
          <div className="mt-1 font-display text-3xl font-bold text-azul">
            {formatEur(mine.allTimeEur)}
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Quem gastou o quê</h2>
        {byUser.length === 0 ? (
          <p className="card p-6 text-center text-sm text-ink-soft">
            Ainda ninguém usou a Sandra este mês.
          </p>
        ) : (
          <div className="card divide-y divide-sand/70">
            {byUser.map((u) => (
              <div
                key={u.username}
                className="flex items-center gap-3 px-4 py-3"
              >
                <span className="text-xl" aria-hidden>
                  {avatarFor(u.username)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{titleCase(u.username)}</div>
                  <div className="text-xs text-ink-faint">
                    {u.calls} {u.calls === 1 ? "pedido" : "pedidos"}
                  </div>
                </div>
                <div className="shrink-0 font-semibold tabular-nums">
                  {formatEur(u.monthEur)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-xs leading-relaxed text-ink-faint">
        Estimated from the tokens each request actually used, at the model&apos;s
        published price, converted at {usdToEur().toFixed(2).replace(".", ",")} €
        per $1. Change the rate with the <code>USD_TO_EUR</code> environment
        variable. Treat it as a close estimate, not the invoice.
      </p>
    </div>
  );
}
