"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ContentUnit } from "@/lib/actions/admin";
import { setUnitStatus } from "@/lib/actions/units";

/**
 * Publish / unpublish straight from the content index. Reuses the existing
 * setUnitStatus action (which re-checks requireStaff itself); router.refresh
 * is what redraws THIS page, since that action only revalidates /unidades,
 * /admin and the unit itself.
 */
export function UnitRows({ units }: { units: ContentUnit[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [failedId, setFailedId] = useState<number | null>(null);

  function toggle(u: ContentUnit) {
    const next = u.status === "published" ? "draft" : "published";
    setBusyId(u.id);
    setFailedId(null);
    startTransition(async () => {
      try {
        await setUnitStatus(u.id, next);
        router.refresh();
      } catch {
        setFailedId(u.id);
      } finally {
        setBusyId(null);
      }
    });
  }

  if (units.length === 0) {
    return <p className="px-4 py-3 text-sm text-ink-faint">Nada por aqui.</p>;
  }

  return (
    <ul className="divide-y divide-sand/70">
      {units.map((u) => {
        const busy = pending && busyId === u.id;
        const draft = u.status !== "published";
        return (
          <li key={u.id} className="px-4 py-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Link
                href={`/unidades/${u.slug}`}
                className="min-w-0 flex-1 basis-full text-sm font-medium hover:text-olive sm:basis-auto"
              >
                <span className="block truncate">{u.title}</span>
                {u.titlePt ? (
                  <span className="block truncate text-xs text-ink-faint">
                    {u.titlePt}
                  </span>
                ) : null}
              </Link>

              <span
                className={
                  u.items > 0
                    ? "chip shrink-0"
                    : "chip shrink-0 bg-terra-pale text-terra-dark"
                }
              >
                {u.items} {u.items === 1 ? "atividade" : "atividades"}
              </span>
              <span
                className={
                  u.hasNote
                    ? "chip shrink-0 bg-azul-pale text-azul"
                    : "chip shrink-0 bg-cream text-ink-soft"
                }
              >
                {u.hasNote ? "nota escrita" : "sem nota"}
              </span>

              <button
                type="button"
                onClick={() => toggle(u)}
                disabled={pending}
                className={
                  draft
                    ? "min-h-11 shrink-0 cursor-pointer rounded-xl bg-terra-pale px-3 text-xs font-semibold text-terra-dark transition-colors hover:bg-terra hover:text-paper disabled:cursor-not-allowed disabled:opacity-50"
                    : "min-h-11 shrink-0 cursor-pointer rounded-xl bg-sage-pale px-3 text-xs font-semibold text-olive transition-colors hover:bg-olive hover:text-paper disabled:cursor-not-allowed disabled:opacity-50"
                }
              >
                {busy
                  ? "A guardar…"
                  : draft
                    ? "rascunho · publicar"
                    : "publicada · retirar"}
              </button>
            </div>
            {failedId === u.id ? (
              <p className="mt-1.5 text-xs text-terra-dark">
                Não deu para mudar o estado. Tenta outra vez.
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
