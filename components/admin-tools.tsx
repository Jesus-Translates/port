"use client";

import { useTransition } from "react";
import {
  adminDeleteContent,
  clearTtsCache,
  resetDeck,
} from "@/lib/actions/admin";
import { avatarFor } from "@/lib/people";

type Item = { id: number; label: string; sub: string };

export function ContentList({
  kind,
  items,
}: {
  kind: "homework" | "quiz" | "note" | "kudo";
  items: Item[];
}) {
  const [pending, startTransition] = useTransition();
  if (items.length === 0) {
    return <p className="px-4 py-3 text-sm text-ink-faint">Nada por aqui.</p>;
  }
  return (
    <ul className="divide-y divide-sand/70">
      {items.map((i) => (
        <li key={i.id} className="flex items-center gap-3 px-4 py-2.5">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{i.label}</div>
            <div className="text-xs text-ink-faint">{i.sub}</div>
          </div>
          <button
            className="shrink-0 p-1 text-ink-faint hover:text-terra"
            disabled={pending}
            title="Apagar"
            onClick={() => {
              if (confirm(`Apagar “${i.label}”?`)) {
                startTransition(() => adminDeleteContent(kind, i.id));
              }
            }}
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}

export function DangerTools({
  ttsClips,
  students,
}: {
  ttsClips: number;
  students: string[];
}) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="btn-ghost text-terra-dark"
          disabled={pending || ttsClips === 0}
          onClick={() => {
            if (
              confirm(
                `Apagar os ${ttsClips} áudios em cache? Regeneram-se sozinhos (útil depois de trocar a voz).`
              )
            ) {
              startTransition(() => clearTtsCache());
            }
          }}
        >
          🔊 Limpar cache de áudio ({ttsClips})
        </button>
      </div>
      <div>
        <span className="label">Reiniciar baralho de revisão</span>
        <div className="flex flex-wrap gap-2">
          {students.map((u) => (
            <button
              key={u}
              className="rounded-full border border-sand bg-white/70 px-3 py-1.5 text-xs capitalize hover:border-terra hover:text-terra-dark"
              disabled={pending}
              onClick={() => {
                if (
                  confirm(
                    `Apagar TODOS os cartões de revisão de ${u}? Não há volta.`
                  )
                ) {
                  startTransition(() => resetDeck(u));
                }
              }}
            >
              {avatarFor(u)} {u}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
