import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { LsPanel, LsSubscribe } from "@/components/ls-panel";
import { isOperator, requireSession } from "@/lib/auth";
import { getDb, lsSessions } from "@/lib/db";
import { lsToken } from "@/lib/ls";
import { azureConfigured } from "@/lib/tts";

export const metadata = { title: "No carro" };

function whenLabel(d: Date): string {
  return new Date(d).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Lisbon",
  });
}

function sizeLabel(bytes: number): string {
  if (bytes <= 0) return "";
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Absolute origin — the podcast feed URL has to work outside the browser. */
async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export default async function ListenSpeakPage() {
  const session = await requireSession();

  const header = (
    <header>
      <Link href="/practice" className="text-xs text-ink-faint hover:text-olive">
        ← Praticar
      </Link>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">
        🎧 No carro
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        Revisão mãos-livres para o carro, a caminhada ou a cozinha: a pergunta
        em inglês → silêncio para responderes → a resposta em português.
      </p>
    </header>
  );

  if (!azureConfigured()) {
    // The variable names are deploy-time homework for whoever runs the
    // platform — a family should never be told to redeploy anything. They get
    // a calm pause note with somewhere useful to go instead.
    const operator = await isOperator(session.username);
    return (
      <div className="space-y-6">
        {header}
        {operator ? (
          <div className="card border-terra/40 bg-terra-pale/30 p-6 text-center">
            <div className="mb-2 text-4xl" aria-hidden>
              🔑
            </div>
            <p className="font-medium">
              Esta funcionalidade precisa das variáveis AZURE_SPEECH_KEY e
              AZURE_SPEECH_REGION.
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Listen &amp; Speak needs Azure&rsquo;s multi-voice neural speech
              to put an English prompt and a Portuguese answer in one
              recording. Add the two variables to the deployment and this page
              wakes up.
            </p>
          </div>
        ) : (
          <div className="card p-6 text-center">
            <div className="mb-2 text-4xl" aria-hidden>
              🎧
            </div>
            <p className="font-medium">
              As sessões mãos-livres estão em pausa.
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              De momento não é possível gerar sessões novas. Entretanto, podes
              rever os teus cartões em{" "}
              <Link
                href="/practice/rever"
                className="underline underline-offset-2 hover:text-olive"
              >
                Rever
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    );
  }

  const [token, origin, sessions] = await Promise.all([
    lsToken(session.username),
    getOrigin(),
    getDb()
      .select({
        id: lsSessions.id,
        cardCount: lsSessions.cardCount,
        bytes: lsSessions.bytes,
        createdAt: lsSessions.createdAt,
      })
      .from(lsSessions)
      .where(eq(lsSessions.username, session.username))
      .orderBy(desc(lsSessions.createdAt), desc(lsSessions.id))
      .limit(5),
  ]);

  const audioUrl = (id: number) =>
    `/api/ls/audio?id=${id}&t=${encodeURIComponent(token)}`;
  const feedUrl = `${origin}/api/ls/feed?t=${encodeURIComponent(token)}`;

  return (
    <div className="space-y-6">
      {header}

      <section className="card bg-azul-pale/40 p-4">
        <h2 className="font-semibold">Como funciona</h2>
        <ol className="mt-2 space-y-1.5 text-sm text-ink-soft">
          <li>
            <span className="font-medium text-ink">1.</span> Ouves a pergunta em
            inglês — one of your due cards.
          </li>
          <li>
            <span className="font-medium text-ink">2.</span> Quatro segundos e
            meio de silêncio:{" "}
            <strong className="text-terra-dark">
              responde EM VOZ ALTA antes da resposta
            </strong>{" "}
            — saying it beats thinking it.
          </li>
          <li>
            <span className="font-medium text-ink">3.</span> Chega a resposta em
            português europeu. Repete-a e segue para o cartão seguinte.
          </li>
        </ol>
        <p className="mt-2 text-xs text-ink-faint">
          Sessions don&rsquo;t grade anything — they warm up the cards you will
          see in Rever.
        </p>
      </section>

      <LsPanel hasSessions={sessions.length > 0} />

      {sessions.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">As tuas sessões</h2>
          {sessions.map((s) => (
            <div key={s.id} className="card space-y-2 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{whenLabel(s.createdAt)}</span>
                <span className="chip">
                  {s.cardCount === 1 ? "1 cartão" : `${s.cardCount} cartões`}
                </span>
                {s.bytes > 0 ? (
                  <span className="text-xs text-ink-faint">
                    {sizeLabel(s.bytes)}
                  </span>
                ) : null}
                <a
                  href={audioUrl(s.id)}
                  download={`listen-speak-${s.id}.mp3`}
                  className="ml-auto text-xs text-ink-faint hover:text-olive"
                >
                  ⬇︎ Descarregar
                </a>
              </div>
              <audio
                controls
                preload="none"
                className="w-full"
                src={audioUrl(s.id)}
              />
            </div>
          ))}
        </section>
      ) : (
        <p className="card p-6 text-center text-sm text-ink-soft">
          Ainda não tens sessões. Carrega em{" "}
          <span className="font-medium">Gerar sessão de hoje</span> — leva menos
          de um minuto.
        </p>
      )}

      <LsSubscribe feedUrl={feedUrl} />
    </div>
  );
}
