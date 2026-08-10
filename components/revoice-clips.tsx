"use client";

import { useState } from "react";

/**
 * Find and repair listening clips whose speakers got a wrong-gender voice.
 *
 * A button rather than a curl: the endpoint is session-gated, so running it by
 * hand means extracting a cookie. It also has to be run on the DEPLOYED app —
 * the Azure credentials are only there — and this is the surface that is
 * already open in that browser.
 *
 * Diagnose is free and changes nothing. Repair spends Azure credits and
 * overwrites stored audio, so it only appears once something is actually
 * wrong, and it names the cost first.
 */

type Speaker = {
  name: string;
  gender: "f" | "m";
  from: string;
  to: string;
  wrong: boolean;
};
type Clip = {
  id: number;
  title: string;
  storage: string;
  wrong: string[];
  speakers: Speaker[];
};
type Diagnosis = {
  azureConfigured: boolean;
  blockedBy: string[];
  needsRepair: number;
  estimatedCostUsd: number;
  clips: Clip[];
};

export function RevoiceClips() {
  const [busy, setBusy] = useState<"none" | "checking" | "fixing">("none");
  const [seen, setSeen] = useState<Diagnosis | null>(null);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  async function check() {
    setBusy("checking");
    setNote(null);
    try {
      const r = await fetch("/api/admin/revoice-clips");
      const j = (await r.json()) as Diagnosis & { error?: string };
      if (!r.ok) throw new Error(j.error ?? "Falhou.");
      setSeen(j);
      if (j.needsRepair === 0) {
        setNote({ ok: true, text: "Todas as vozes estão certas." });
      }
    } catch (e) {
      setNote({ ok: false, text: (e as Error).message });
    } finally {
      setBusy("none");
    }
  }

  async function fix() {
    setBusy("fixing");
    setNote(null);
    try {
      const r = await fetch("/api/admin/revoice-clips", { method: "POST" });
      const j = (await r.json()) as {
        repaired?: number;
        attempted?: number;
        error?: string;
      };
      if (!r.ok) throw new Error(j.error ?? "Falhou.");
      setNote({
        ok: true,
        text: `${j.repaired}/${j.attempted} diálogo(s) regravados com as vozes certas.`,
      });
      await check();
    } catch (e) {
      setNote({ ok: false, text: (e as Error).message });
    } finally {
      setBusy("none");
    }
  }

  return (
    <div className="card space-y-3 p-5">
      <div>
        <p className="font-medium">Vozes dos diálogos</p>
        <p className="mt-0.5 text-sm text-ink-soft">
          Até 10/08/2026 as vozes eram atribuídas por ordem de entrada, não por
          género — a Ana podia falar com voz de homem. O gerador já está
          corrigido; o áudio antigo só muda se for regravado.
        </p>
      </div>

      {note ? (
        <p
          role="status"
          className={`rounded-lg px-3 py-2 text-sm ${
            note.ok ? "bg-sage-pale text-olive" : "bg-terra-pale text-terra-dark"
          }`}
        >
          {note.text}
        </p>
      ) : null}

      {seen && seen.clips.length > 0 ? (
        <div className="space-y-2">
          {seen.clips.map((c) => (
            <div key={c.id} className="rounded-lg border border-sand bg-white/60 px-3 py-2">
              <p className="text-sm font-medium">
                #{c.id} {c.title}{" "}
                <span className="chip bg-cream text-ink-soft">{c.storage}</span>
              </p>
              <ul className="mt-1 space-y-0.5">
                {c.speakers.map((s) => (
                  <li key={s.name} className="text-2xs text-ink-soft">
                    {s.wrong ? "✗" : "·"} {s.name} {s.gender === "f" ? "♀" : "♂"}{" "}
                    <code>{s.from}</code>
                    {s.from === s.to ? " (mantém)" : ` → `}
                    {s.from === s.to ? null : <code>{s.to}</code>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}

      {seen && seen.blockedBy.length > 0 ? (
        <p className="rounded-lg bg-terra-pale px-3 py-2 text-sm text-terra-dark">
          ⚠️ Não dá para regravar aqui: {seen.blockedBy.join(" · ")}.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={check}
          disabled={busy !== "none"}
          className="btn-ghost"
        >
          {busy === "checking" ? "A verificar…" : "Verificar vozes"}
        </button>
        {seen && seen.needsRepair > 0 && seen.blockedBy.length === 0 ? (
          <button
            type="button"
            onClick={fix}
            disabled={busy !== "none"}
            className="btn-primary"
          >
            {busy === "fixing"
              ? "A regravar…"
              : `Regravar ${seen.needsRepair} diálogo(s) · ~$${seen.estimatedCostUsd.toFixed(3)}`}
          </button>
        ) : null}
      </div>
    </div>
  );
}
