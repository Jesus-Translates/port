import Link from "next/link";
import { ListeningElsewhere } from "@/components/listening-elsewhere";
import { shortTopic } from "@/lib/topic-label";
import { desc } from "drizzle-orm";
import { ListeningGenerate } from "@/components/listening-generate";
import { UnitReturn } from "@/components/unit-return";
import { UnitStart } from "@/components/unit-start";
import { getMyCefr } from "@/lib/actions/profile";
import { isOperator, requireSession } from "@/lib/auth";
import { getDb, listeningClips } from "@/lib/db";
import { rankByTopic } from "@/lib/topic-match";
import { azureConfigured } from "@/lib/tts";
import { unitContextFrom } from "@/lib/unit-context";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Escutar" };

/** How many "já existe" suggestions are worth showing before it reads as noise. */
const MAX_MATCHES = 4;

function one(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : (v ?? "")).trim();
}

export default async function EscutarPage(props: PageProps<"/escutar">) {
  const session = await requireSession();
  const sp = await props.searchParams;
  const unit = await unitContextFrom(sp);
  // The step's own topic, falling back to the unit's Portuguese name — a unit
  // item with no topic configured should still land on something about it.
  const tema = one(sp.tema).slice(0, 200) || unit?.titlePt.trim() || "";
  const ready = azureConfigured();
  // The Azure checklist below is deploy-time homework for whoever runs the
  // platform. A paying family should never be told to set environment
  // variables — only the operator sees the setup card.
  const operator = ready ? false : await isOperator(session.username);
  const level = await getMyCefr();
  // 120 rather than 60: the extra rows are only ever used to answer "do we
  // already have one about this?" — the library list below still shows 60.
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
    .limit(120);

  const matches = tema
    ? rankByTopic(clips, tema, (c) => `${c.topic} ${c.title}`).slice(0, MAX_MATCHES)
    : [];
  const listed = clips.slice(0, 60);

  // Opening a clip from a unit step must keep carrying the unit, or the clip
  // page has no idea which item it is fulfilling.
  const carry = unit
    ? `?unidade=${encodeURIComponent(unit.slug)}${unit.itemId ? `&item=${unit.itemId}` : ""}`
    : "";
  const clipHref = (id: number) => `/escutar/${id}${carry}`;

  // From a unit step, the one-tap button wins: it already knows the topic AND
  // carries the unit onto the new clip, which the library's own form cannot do.
  const generate = unit ? (
    <UnitStart
      kind="escutar"
      topic={tema}
      level={level}
      unit={unit}
      enabled={ready}
      tone={matches.length > 0 ? "quiet" : "primary"}
    />
  ) : (
    <ListeningGenerate enabled={ready} level={level} initialTopic={tema} />
  );

  return (
    <div className="space-y-6">
      <UnitReturn unit={unit} />

      <header>
        <h1 className="text-2xl font-semibold tracking-tight">🎧 Escutar</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Short two-voice conversations at real speed. Listen first, then follow
          the transcript word by word — and tap any line to hear it again.
        </p>
      </header>

      {ready ? null : !operator ? (
        <div className="card space-y-1.5 p-5">
          <h2 className="font-semibold">🎧 Diálogos novos em pausa</h2>
          <p className="text-sm text-ink-soft">
            De momento não é possível criar diálogos novos. Tudo o que já foi
            gravado continua a tocar em baixo.
          </p>
        </div>
      ) : (
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

      {matches.length > 0 ? (
        <>
          {/* The whole point: a step about "o mercado" must open the dialogue
              we already have about o mercado, not quietly make a second one. */}
          <section className="card space-y-3 p-5">
            <div>
              <h2 className="font-semibold">✅ Já existe sobre «{shortTopic(tema)}»</h2>
              <p className="mt-0.5 text-sm text-ink-soft">
                Abre um destes — não é preciso gravar nada de novo.{" "}
                <span className="text-ink-faint">
                  We already have these; open one instead of generating.
                </span>
              </p>
            </div>
            <div className="divide-y divide-sand/70 overflow-hidden rounded-xl border border-sand bg-white/70">
              {matches.map((c) => (
                <Link
                  key={c.id}
                  href={clipHref(c.id)}
                  className="flex min-h-14 items-center gap-3 px-4 py-3 transition-colors hover:bg-sage-pale/40"
                >
                  <span className="shrink-0 text-lg" aria-hidden>
                    {c.source === "human" ? "🎙️" : "🎧"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{c.title}</span>
                    {c.topic ? (
                      <span className="block truncate text-xs text-ink-faint">
                        {c.topic}
                      </span>
                    ) : null}
                  </span>
                  <span className="chip shrink-0">{c.cefr}</span>
                  <span className="shrink-0 text-sm text-ink-faint" aria-hidden>
                    →
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {unit ? (
            // Already the quiet tone — it sits under something better.
            generate
          ) : (
            <details>
              <summary className="flex min-h-11 cursor-pointer items-center text-sm text-ink-soft">
                …ou pede um diálogo novo sobre «{tema}» ✨
              </summary>
              <div className="mt-2">{generate}</div>
            </details>
          )}
        </>
      ) : (
        generate
      )}

      {listed.length === 0 ? (
        <p className="card p-8 text-center text-sm text-ink-soft">
          Ainda não há nada para ouvir — pede o primeiro diálogo à Sandra ↑
        </p>
      ) : (
        <div className="card divide-y divide-sand/70">
          {listed.map((c) => (
            <Link
              key={c.id}
              href={clipHref(c.id)}
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
      <ListeningElsewhere />

    </div>
  );
}
