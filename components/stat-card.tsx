/** The panel stat tile, shared by the family panel and the operator console. */
export function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "olive" | "terra" | "azul";
}) {
  const colour =
    tone === "terra"
      ? "text-terra"
      : tone === "azul"
        ? "text-azul"
        : "text-olive";
  return (
    <div className="card p-4">
      <div className="text-xs text-ink-soft">{label}</div>
      <div className={`mt-1 font-display text-3xl font-bold ${colour}`}>
        {value}
      </div>
      <div className="mt-1 text-xs text-ink-faint">{sub}</div>
    </div>
  );
}
