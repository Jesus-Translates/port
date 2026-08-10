import { type AnswerCheck, type DiffTok, spellingSlips } from "@/lib/diff";
import { cn } from "@/lib/utils";

/**
 * Shows a wrong answer word by word: what the learner wrote (muted, with the
 * words to drop or fix marked) over the correct version (with the words they
 * missed marked). Knowing WHICH word slipped is the whole lesson — "the right
 * answer was X" leaves them to spot the difference themselves.
 */
export function AnswerDiff({
  check,
  nearMiss = false,
  className,
}: {
  check: AnswerCheck;
  /** The grader already called this a near-miss — keep that framing. */
  nearMiss?: boolean;
  className?: string;
}) {
  const slips = spellingSlips(check);
  const onlySpelling = check.verdict === "quase";
  const lead =
    onlySpelling || nearMiss
      ? {
          pt: onlySpelling
            ? "Quase! A ideia estava certa — só a escrita escorregou."
            : "Quase! A ideia estava certa — vê as palavras marcadas.",
          en: onlySpelling
            ? "Right answer — only the accents or capitals slipped."
            : "Right idea — check the marked words.",
          tone: "text-terra-dark",
        }
      : check.verdict === "incompleto"
        ? {
            pt: "Bom até aqui — a resposta ficou a meio.",
            en: "Correct as far as it goes — the marked words are missing.",
            tone: "text-olive",
          }
        : null;

  return (
    <div
      className={cn(
        "space-y-2 rounded-xl border border-sand bg-white/70 px-3 py-2.5",
        className
      )}
    >
      {lead ? (
        <div>
          <p className={cn("text-sm font-semibold", lead.tone)}>{lead.pt}</p>
          <p className="text-xs text-ink-soft">{lead.en}</p>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Row glyph="✗" tone="text-terra">
          <span className="sr-only">A tua resposta: </span>
          {check.attempt.length > 0 ? (
            <Line
              toks={check.attempt}
              slips={slips.attempt}
              side="attempt"
              className="text-[15px] text-ink-soft"
            />
          ) : (
            <p className="text-[15px] text-ink-faint italic">
              Ficou em branco.
            </p>
          )}
        </Row>

        <Row glyph="✓" tone="text-olive">
          <div className="text-2xs font-semibold tracking-wide text-olive uppercase">
            Assim fica certo
          </div>
          <Line
            toks={check.target}
            slips={slips.target}
            side="target"
            className="font-display text-[16px] text-ink"
          />
        </Row>
      </div>
    </div>
  );
}

/** Glyph in a fixed column so both lines start at the same x on a phone. */
function Row({
  glyph,
  tone,
  children,
}: {
  glyph: string;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[0.9rem_minmax(0,1fr)] gap-x-1.5">
      <span aria-hidden className={cn("text-sm leading-6", tone)}>
        {glyph}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function Line({
  toks,
  slips,
  side,
  className,
}: {
  toks: DiffTok[];
  slips: Set<number>;
  side: "attempt" | "target";
  className?: string;
}) {
  return (
    <p
      className={cn("flex flex-wrap items-baseline gap-x-1 leading-6", className)}
    >
      {toks.map((tok, i) => (
        <span
          key={i}
          className={cn(
            tokenClass(tok.status, side),
            // Right word, wrong accent or capital — a nudge, not a mark.
            slips.has(i) && "underline decoration-dotted underline-offset-4"
          )}
        >
          {tok.text}
        </span>
      ))}
    </p>
  );
}

/** Terracotta marks the words to change, sage the words to keep. */
function tokenClass(
  status: DiffTok["status"],
  side: "attempt" | "target"
): string {
  if (status === "same") return "";
  if (side === "attempt") {
    return status === "extra"
      ? "rounded bg-terra-pale px-1 text-terra-dark line-through decoration-terra-dark/60"
      : "rounded bg-terra-pale px-1 font-semibold text-terra-dark";
  }
  // Target line: "wrong" is the word that belonged there, "missing" the one
  // they never wrote — both are things to learn, so both read as the answer.
  return "rounded bg-sage-light px-1 font-semibold text-ink";
}
