import { generateText } from "ai";
import { getModel } from "@/lib/ai";
import { lintPt, correctionPrompt, type Finding } from "@/lib/pt-lint";
import { recordUsage, modelId } from "@/lib/usage";

/**
 * Generate, check the Portuguese, and retry ONCE if it drifted.
 *
 * A prompt is advice. This is a check. The model writes far more Brazilian
 * than European Portuguese in training, so it will drift no matter how firmly
 * we ask — and the drift lands on exactly the everyday words a learner then
 * repeats in a shop.
 *
 * The second call only happens when the deterministic linter actually finds
 * something, so the common case costs nothing extra.
 */
export async function generateEuropean(
  opts: { instructions: string; prompt: string; username?: string; kind?: string }
): Promise<{ text: string; findings: Finding[]; retried: boolean }> {
  const first = await generateText({
    model: getModel(),
    instructions: opts.instructions,
    prompt: opts.prompt,
  });
  if (opts.username) {
    await recordUsage(opts.username, opts.kind ?? "generate", modelId(), first.usage).catch(
      () => {}
    );
  }

  const findings = lintPt(first.text).filter((f) => f.severity === "high");
  if (findings.length === 0) {
    return { text: first.text, findings: [], retried: false };
  }

  const second = await generateText({
    model: getModel(),
    instructions: opts.instructions,
    prompt: `${opts.prompt}

--- YOUR PREVIOUS ANSWER ---
${first.text}

--- ${correctionPrompt(findings)}`,
  });
  if (opts.username) {
    await recordUsage(opts.username, opts.kind ?? "generate", modelId(), second.usage).catch(
      () => {}
    );
  }

  // Keep whichever is cleaner — a retry that made things worse is still a loss.
  const after = lintPt(second.text).filter((f) => f.severity === "high");
  const better = after.length <= findings.length ? second.text : first.text;
  return { text: better, findings, retried: true };
}
