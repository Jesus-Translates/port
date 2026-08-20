"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bi } from "@/components/bilingual";

/** The generate button — one session per 10 minutes, enforced server-side. */
export function LsPanel({ hasSessions }: { hasSessions: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ls/generate", { method: "POST" });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setError(data?.error ?? "Não deu para gerar a sessão. Tenta outra vez.");
        return;
      }
      router.refresh();
    } catch {
      setError("Não deu para gerar a sessão. Tenta outra vez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-semibold">
            {hasSessions ? "Nova sessão" : "A tua primeira sessão"}
          </div>
          <p className="mt-0.5 text-xs text-ink-soft">
            Up to 20 of your due cards, about six minutes. One per 10 minutes.
          </p>
        </div>
        <button className="btn-terra" disabled={busy} onClick={generate}>
          {busy ? (
            <Bi pt="A gravar… (~30s)" en="Recording… (~30s)" inline />
          ) : (
            <Bi pt="✨ Gerar sessão de hoje" en="Generate today's session" inline />
          )}
        </button>
      </div>
      {error ? <p className="text-sm text-terra-dark">{error}</p> : null}
    </div>
  );
}

/** The personal podcast feed URL — copy it into any podcast app. */
export function LsSubscribe({ feedUrl }: { feedUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="card space-y-3 p-4">
      <div>
        <h2 className="font-semibold">🎙️ Subscrever como podcast</h2>
        <p className="mt-0.5 text-xs text-ink-soft">
          Paste this feed into Apple Podcasts, Overcast or Pocket Casts (&ldquo;add
          by URL&rdquo;) — new sessions arrive on your phone, ready for the car.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="input min-w-0 flex-1 font-mono text-xs"
          readOnly
          value={feedUrl}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Endereço do teu podcast pessoal"
        />
        <button className="btn-ghost shrink-0" onClick={copy}>
          {copied ? (
            <Bi pt="Copiado ✓" en="Copied" inline />
          ) : (
            <Bi pt="Copiar" en="Copy" inline />
          )}
        </button>
      </div>
      <p className="text-xs text-ink-faint">
        ⚠️ O link contém o teu acesso — não partilhes.
      </p>
    </section>
  );
}
