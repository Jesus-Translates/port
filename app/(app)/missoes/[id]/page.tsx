import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { desc, eq, and } from "drizzle-orm";
import { Markdown } from "@/components/markdown";
import { MissionAttempt } from "@/components/mission-attempt";
import { requireSession } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { getDb, missionAttempts, missions } from "@/lib/db";
import { formatDate } from "@/lib/utils";

/** "I did it" — no audio, no AI, just credit where it's due. */
async function selfReportMission(id: number, note: string) {
  "use server";
  const session = await requireSession();
  if (!Number.isInteger(id) || id <= 0) return;

  const db = getDb();
  const [mission] = await db
    .select({ id: missions.id, title: missions.title })
    .from(missions)
    .where(eq(missions.id, id))
    .limit(1);
  if (!mission) return;

  await db.insert(missionAttempts).values({
    missionId: mission.id,
    username: session.username,
    kind: "self",
    transcript: String(note ?? "").trim().slice(0, 2000) || null,
    feedbackMd: null,
    score: null,
  });
  await logActivity(
    session.username,
    "missao",
    `Missão «${mission.title}» feita na rua 🗺️`,
    15
  );
  revalidatePath("/missoes");
  revalidatePath(`/missoes/${mission.id}`);
}

export default async function MissaoPage(props: PageProps<"/missoes/[id]">) {
  const session = await requireSession();
  const { id } = await props.params;
  const missionId = Number(id);
  if (!Number.isInteger(missionId)) notFound();

  const db = getDb();
  const [mission] = await db
    .select()
    .from(missions)
    .where(eq(missions.id, missionId))
    .limit(1);
  if (!mission) notFound();

  const past = await db
    .select()
    .from(missionAttempts)
    .where(
      and(
        eq(missionAttempts.missionId, mission.id),
        eq(missionAttempts.username, session.username)
      )
    )
    .orderBy(desc(missionAttempts.createdAt))
    .limit(10);

  return (
    <article className="space-y-5">
      <header>
        <Link href="/missoes" className="text-xs text-ink-faint hover:text-olive">
          ← Missões
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {mission.title}
          </h1>
          <span className="chip bg-azul-pale text-azul">
            📍 {mission.location}
          </span>
          <span className="chip">{mission.cefr}</span>
        </div>
      </header>

      <section className="rounded-2xl border-l-4 border-sage bg-sage-pale/50 px-5 py-4">
        <p className="font-display text-[19px] leading-relaxed">
          {mission.promptPt}
        </p>
        <p className="mt-1 text-sm text-ink-soft">{mission.promptEn}</p>
      </section>

      <section className="card p-5">
        <h2 className="mb-2 font-display text-lg font-semibold">
          💡 Antes de ires
        </h2>
        <ul className="space-y-1.5 text-sm text-ink-soft">
          <li>
            <strong>Diz primeiro em casa, depois vai!</strong> Rehearse it out
            loud at the kitchen table until it comes out in one piece.
          </li>
          <li>
            Começa sempre com <strong>bom dia</strong> (até às 12h) ou{" "}
            <strong>boa tarde</strong>, e chama a atenção com{" "}
            <strong>faz favor</strong> — nunca «desculpe, senhor».
          </li>
          <li>
            Se não perceberes, não fujas:{" "}
            <strong>«desculpe, pode repetir mais devagar?»</strong> resolve
            quase tudo.
          </li>
          <li>
            No fim: <strong>obrigado</strong> (homens) /{" "}
            <strong>obrigada</strong> (mulheres) e <strong>até logo</strong>.
          </li>
        </ul>
      </section>

      <MissionAttempt missionId={mission.id} selfReport={selfReportMission} />

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold">
          O teu histórico{" "}
          <span className="text-sm font-normal text-ink-faint">
            · your attempts
          </span>
        </h2>
        {past.length === 0 ? (
          <p className="card p-6 text-center text-sm text-ink-soft">
            Ainda não fizeste esta missão. Vai lá! 🚶
          </p>
        ) : (
          <ul className="space-y-2">
            {past.map((a) => (
              <li key={a.id} className="card space-y-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip">
                    {a.kind === "audio" ? "🎙️ gravada" : "✅ auto-relato"}
                  </span>
                  {a.score !== null ? (
                    <span className="chip bg-sage-pale text-olive">
                      {a.score}/10
                    </span>
                  ) : null}
                  <span className="ml-auto text-xs text-ink-faint">
                    {formatDate(a.createdAt)}
                  </span>
                </div>
                {a.transcript ? (
                  <p className="rounded-xl bg-cream/60 px-3 py-2 text-[15px]">
                    {a.transcript}
                  </p>
                ) : null}
                {a.feedbackMd ? (
                  <div className="flex gap-2 rounded-xl bg-sage-pale/60 px-3 py-2">
                    <span aria-hidden>🌙</span>
                    <Markdown className="text-[14px]">{a.feedbackMd}</Markdown>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
