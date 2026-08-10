import Link from "next/link";
import { notFound } from "next/navigation";
import { RevoiceClips } from "@/components/revoice-clips";
import { getMonthSpendByKind, getSystemStats } from "@/lib/actions/admin";
import { requireOperator } from "@/lib/auth";
import { azureConfigured, azureVoices } from "@/lib/tts";
import { formatEur } from "@/lib/usage";

export const metadata = { title: "Sistema" };

/** Neon's free tier. Base64 inflates every blob by a third, so audio is the
 *  only thing in this database with any chance of filling it. */
const NEON_FREE_BYTES = 0.5 * 1024 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

/** What a kind in ai_usage actually was, so the bill reads like English. */
const KIND_LABEL: Record<string, string> = {
  tts: "Voz (text-to-speech)",
  stt: "Transcrição da fala",
  grade: "Correção de respostas",
  tutor: "Conversas com a Sandra",
  homework: "TPC gerado",
  quiz: "Testes gerados",
  lesson: "Lições geradas",
  story: "Histórias",
  escutar: "Diálogos para escutar",
  reference: "Livro de frases",
  suggest: "Sugestões",
  "jogo-pares": "Jogo dos pares",
  "jogo-frase": "Jogo das frases",
};

export default async function SystemPage() {
  // Spend, storage and table counts read across every household, so this is
  // the INSTANCE operator's page — not a family admin's. requireOperator
  // redirects anyone else before a single row is read.
  await requireOperator();

  const [stats, byKind] = await Promise.all([
    getSystemStats(),
    getMonthSpendByKind(),
  ]);
  if (!stats) notFound();

  const azure = azureConfigured();
  const monthTotal = byKind.reduce((s, k) => s + k.eur, 0);
  const topEur = byKind[0]?.eur ?? 0;
  const audio = stats.audio;
  const usedPct = Math.min(100, (audio.totalB64 / NEON_FREE_BYTES) * 100);

  const warnings: string[] = [];
  if (!azure) {
    warnings.push(
      "AZURE_SPEECH_KEY / AZURE_SPEECH_REGION não estão definidos — a voz cai para a OpenAI, que custa mais e não é pt-PT nativo."
    );
  }
  if (usedPct >= 60) {
    warnings.push(
      `O áudio guardado já ocupa ${formatBytes(audio.totalB64)} — ${usedPct.toFixed(0)}% do meio gigabyte do plano gratuito da Neon. Limpar a cache de áudio no painel liberta ${formatBytes(audio.ttsB64)}.`
    );
  }
  if (monthTotal >= 5) {
    warnings.push(
      `A IA já custou ${formatEur(monthTotal)} este mês — mais do que o normal para a família.`
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin" className="text-xs text-ink-faint hover:text-olive">
          ← Painel
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          🔧 Sistema
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          What the deployment looks like from the inside: speech provider, where
          the AI money went, and how full the database is getting.
        </p>
      </header>

      {warnings.length > 0 ? (
        <ul className="space-y-2">
          {warnings.map((w) => (
            <li
              key={w}
              className="rounded-xl bg-terra-pale px-4 py-3 text-sm text-terra-dark"
            >
              ⚠️ {w}
            </li>
          ))}
        </ul>
      ) : null}

      <section>
        <h2 className="mb-3 text-lg font-semibold">🗣️ Voz</h2>
        <div className="card space-y-2 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={
                azure
                  ? "chip bg-sage-pale text-olive"
                  : "chip bg-terra-pale text-terra-dark"
              }
            >
              {azure ? "Azure Speech ativo" : "Azure Speech não configurado"}
            </span>
            <span className="text-sm text-ink-soft">
              {azure
                ? "Vozes neurais pt-PT nativas."
                : "A síntese passa para a OpenAI."}
            </span>
          </div>
          {azure ? (
            <p className="text-xs text-ink-faint">
              Vozes em rotação: {azureVoices().join(" · ")}
            </p>
          ) : null}
        </div>

        {/* Lives here rather than in a script because the Azure keys are only
            present in the deployed environment — this is where the repair can
            actually run. */}
        <div className="mt-3">
          <RevoiceClips />
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-lg font-semibold">💶 Gasto de IA este mês</h2>
        <p className="mb-3 text-sm text-ink-soft">
          Total {formatEur(monthTotal)} — broken down by what the call was
          actually for.
        </p>
        <div className="card divide-y divide-sand/70">
          {byKind.length === 0 ? (
            <p className="px-4 py-3 text-sm text-ink-faint">
              Nenhum pedido à IA este mês.
            </p>
          ) : (
            byKind.map((k) => (
              <div key={k.kind} className="px-4 py-3">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="min-w-0 flex-1 text-sm font-medium">
                    {KIND_LABEL[k.kind] ?? k.kind}
                  </span>
                  <span className="text-xs text-ink-faint">
                    {k.calls} {k.calls === 1 ? "pedido" : "pedidos"}
                  </span>
                  <span className="font-semibold text-terra-dark tabular-nums">
                    {formatEur(k.eur)}
                  </span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-sand">
                  <div
                    className="h-1.5 rounded-full bg-terra"
                    style={{
                      width: `${topEur > 0 ? Math.max(2, (k.eur / topEur) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-lg font-semibold">💾 Áudio guardado</h2>
        <p className="mb-3 text-sm text-ink-soft">
          Every clip lives in Postgres as base64, which is a third bigger than
          the mp3 itself. Neon&rsquo;s free tier is 0.5 GB.
        </p>
        <div className="card space-y-3 p-5">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <span className="font-display text-2xl font-bold text-olive">
              {formatBytes(audio.totalB64)}
            </span>
            <span className="text-sm text-ink-soft">
              de {formatBytes(NEON_FREE_BYTES)} · {usedPct.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-sand">
            <div
              className={
                usedPct >= 60
                  ? "h-2 rounded-full bg-terra"
                  : "h-2 rounded-full bg-olive"
              }
              style={{ width: `${Math.max(1, usedPct)}%` }}
            />
          </div>
          <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-ink-soft">
                Cache de frases ({stats.tts.rows})
              </dt>
              <dd className="font-medium tabular-nums">
                {formatBytes(audio.ttsB64)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft">Diálogos de escuta</dt>
              <dd className="font-medium tabular-nums">
                {formatBytes(audio.clipsB64)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft">Sessões Listen &amp; Speak</dt>
              <dd className="font-medium tabular-nums">
                {formatBytes(audio.lsB64)}
              </dd>
            </div>
          </dl>
          <p className="text-xs text-ink-faint">
            A cache de frases regenera-se sozinha — pode ser limpa no painel sem
            perder nada.
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">🗃️ Linhas por tabela</h2>
        <div className="card overflow-x-auto">
          <ul className="min-w-72 divide-y divide-sand/70">
            {stats.tables.map((t) => (
              <li
                key={t.name}
                className="flex items-center gap-3 px-4 py-2 text-sm"
              >
                <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-ink-soft">
                  {t.name}
                </span>
                <span className="shrink-0 font-semibold tabular-nums">
                  {t.rows.toLocaleString("pt-PT")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
