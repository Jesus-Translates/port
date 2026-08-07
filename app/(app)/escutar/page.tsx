import Link from "next/link";
import { desc } from "drizzle-orm";
import { ListeningGenerate } from "@/components/listening-generate";
import { getMyCefr } from "@/lib/actions/profile";
import { requireSession } from "@/lib/auth";
import { getDb, listeningClips } from "@/lib/db";
import { azureConfigured } from "@/lib/tts";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Escutar" };

export default async function EscutarPage() {
  await requireSession();
  const ready = azureConfigured();
  const level = await getMyCefr();
  const clips = await getDb()
    .select({
      id: listeningClips.id,
      title: listeningClips.title,
      cefr: listeningClips.cefr,
      topic: listeningClips.topic,
      source: listeningClips.source,
      createdAt: listeningClips.createdAt,
    })
    .from(listeningClips)
    .orderBy(desc(listeningClips.createdAt))
    .limit(60);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">🎧 Escutar</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Short two-voice conversations at real speed. Listen first, then follow
          the transcript word by word — and tap any line to hear it again.
        </p>
      </header>

      {ready ? null : (
        <div className="card space-y-1.5 p-5">
          <h2 className="font-semibold">🔌 Falta ligar as vozes</h2>
          <p className="text-sm text-ink-soft">
            New dialogues need Azure Speech for the pt-PT neural voices. Set{" "}
            <code className="rounded bg-cream px-1 py-0.5 text-[13px]">
              AZURE_SPEECH_KEY
            </code>{" "}
            and{" "}
            <code className="rounded bg-cream px-1 py-0.5 text-[13px]">
              AZURE_SPEECH_REGION
            </code>{" "}
            (optionally{" "}
            <code className="rounded bg-cream px-1 py-0.5 text-[13px]">
              AZURE_TTS_VOICES
            </code>
            ), then redeploy. Everything already recorded still plays below.
          </p>
        </div>
      )}

      <ListeningGenerate enabled={ready} level={level} />

      {clips.length === 0 ? (
        <p className="card p-8 text-center text-sm text-ink-soft">
          Ainda não há nada para ouvir — pede o primeiro diálogo à Luna ↑
        </p>
      ) : (
        <div className="card divide-y divide-sand/70">
          {clips.map((c) => (
            <Link
              key={c.id}
              href={`/escutar/${c.id}`}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-sage-pale/40"
            >
              <span className="shrink-0 text-lg" aria-hidden>
                {c.source === "human" ? "🎙️" : "🎧"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{c.title}</span>
                <span className="block truncate text-xs text-ink-faint">
                  {c.topic ? `${c.topic} · ` : ""}
                  {formatDate(c.createdAt)}
                </span>
              </span>
              {c.source === "human" ? (
                <span className="chip shrink-0 bg-terra-pale text-terra-dark">
                  🎙️ voz real
                </span>
              ) : null}
              <span className="chip shrink-0">{c.cefr}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
