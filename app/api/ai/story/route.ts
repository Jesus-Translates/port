import { generateText, Output } from "ai";
import { and, asc, eq, inArray } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { getModel, storyGenSchema } from "@/lib/ai";
import { currentStyle, referenceContext } from "@/lib/place";
import { familyList } from "@/lib/ai";
import { getSession } from "@/lib/auth";
import { householdMembers, visibleOwners } from "@/lib/tenant";
import { logActivity } from "@/lib/data";
import { getDb, stories } from "@/lib/db";
import { aiDenial, modelId, recordUsage } from "@/lib/usage";

/** Display names of my household — never every account on the instance. */
async function householdNames(): Promise<string[]> {
  return (await householdMembers()).map((m) => m.displayName);
}

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  // Burst limit AND the household's monthly AI allowance, in one check.
  const denied = await aiDenial(session.username);
  if (denied) {
    return NextResponse.json({ error: denied.error }, { status: denied.status });
  }

  let body: { level?: string; seriesTitle?: string; theme?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const level = String(body.level ?? "A2").slice(0, 8);
  const seriesTitle = String(body.seriesTitle ?? "").slice(0, 120);
  const theme = String(body.theme ?? "").slice(0, 300);

  const db = getDb();
  // Continuing a series: give the model the arc so far.
  let priorContext = "";
  let chapter = 1;
  if (seriesTitle) {
    const prior = await db
      .select({
        chapter: stories.chapter,
        title: stories.title,
        textEn: stories.textEn,
      })
      .from(stories)
      // Scoped. A series title is a client-supplied string, and matching on it
      // alone read EVERY household's stories: household B could continue
      // household A's arc — with A's chapter titles and text in the prompt — by
      // guessing the title. The arc-so-far must be MY family's.
      .where(
        and(
          eq(stories.seriesTitle, seriesTitle),
          inArray(stories.createdBy, await visibleOwners())
        )
      )
      .orderBy(asc(stories.chapter));
    if (prior.length > 0) {
      chapter = prior[prior.length - 1].chapter + 1;
      priorContext = prior
        .map((p) => `Ch.${p.chapter} "${p.title}": ${p.textEn.slice(0, 180)}`)
        .join("\n");
    }
  }

  const { output, usage } = await generateText({
    model: getModel(),
    output: Output.object({ schema: storyGenSchema }),
    instructions: `You write serialized graded-reader chapters for a family learning EUROPEAN Portuguese (${familyList(await householdNames())}). ${await currentStyle()}${await referenceContext()}
Set the stories in the learner's own real world — the beach or street they know, the mercado, the escola, neighbours,
the surrounding countryside: warm, lightly funny slice-of-life with recurring fictional characters (do not put the real family members in awkward
situations; a fictional neighbour family works well). Strictly control grammar/vocabulary to the target CEFR level.
Comprehension questions must be answerable ONLY from the text, options plausible, correct one verbatim in "answer".`,
    prompt: priorContext
      ? `Continue the series "${seriesTitle}" at level ${level}. This is chapter ${chapter}. The story so far:\n${priorContext}\n\nWrite the next chapter — continue threads, don't reset.`
      : `Start a new series at level ${level}${theme ? ` about "${theme}"` : ""}. This is chapter 1 — introduce the characters and leave a small hook.`,
  });
  await recordUsage(session.username, "story", modelId(), usage);

  const [row] = await db
    .insert(stories)
    .values({
      seriesTitle: seriesTitle || output.seriesTitle,
      chapter,
      title: output.title,
      level,
      textPt: output.textPt,
      textEn: output.textEn,
      glossary: output.glossary,
      questions: output.questions,
      createdBy: session.username,
    })
    .returning({ id: stories.id });

  await logActivity(
    session.username,
    "story",
    `Nova história: “${output.title}”`,
    5
  );
  return NextResponse.json({ id: row.id });
}
