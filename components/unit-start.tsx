"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bi } from "@/components/bilingual";
import type { UnitContext } from "@/lib/unit-context";
import { cn } from "@/lib/utils";

const LEVELS = ["A1", "A2", "B1", "B2"];

/** Button labels must stay button-sized: a 200-character topic is still a
 *  legal topic, and it must not stretch the page sideways on a phone. */
function short(s: string, max = 44): string {
  const t = s.trim();
  return t.length > max ? `${t.slice(0, max).trimEnd()}…` : t;
}

type Kind = "escutar" | "story";

const META: Record<
  Kind,
  {
    endpoint: string;
    base: string;
    emoji: string;
    newLabel: string;
    newLabelEn: string;
  }
> = {
  escutar: {
    endpoint: "/api/ai/listening",
    base: "/escutar",
    emoji: "🎧",
    newLabel: "Gravar diálogo sobre",
    newLabelEn: "Record a dialogue about",
  },
  story: {
    endpoint: "/api/ai/story",
    base: "/stories",
    emoji: "📕",
    newLabel: "Começar história sobre",
    newLabelEn: "Start a story about",
  },
};

/**
 * Make the thing this unit step is asking for — and stay inside the course.
 *
 * The library's own generate form is fine on its own, but it drops you on the
 * new clip/chapter with no idea which unit sent you, so finishing it could
 * never tick the step off. This one carries `?unidade=&item=` through to the
 * page it opens, and it already knows the topic, so there is nothing to type.
 */
export function UnitStart({
  kind,
  topic,
  level,
  unit,
  seriesTitle = null,
  enabled = true,
  tone = "primary",
}: {
  kind: Kind;
  /** The unit item's topic — the whole reason this button can be one tap. */
  topic: string;
  level: string;
  unit: UnitContext | null;
  /** Story only: continue this series instead of starting a new one. */
  seriesTitle?: string | null;
  /** Escutar only: false while the pt-PT voices are not configured. */
  enabled?: boolean;
  /** "quiet" when something better (an existing clip) sits above this. */
  tone?: "primary" | "quiet";
}) {
  const router = useRouter();
  const meta = META[kind];
  const [cefr, setCefr] = useState(level);
  const [busy, setBusy] = useState<"novo" | "serie" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const carry = unit
    ? `?unidade=${encodeURIComponent(unit.slug)}${unit.itemId ? `&item=${unit.itemId}` : ""}`
    : "";

  async function create(mode: "novo" | "serie") {
    setBusy(mode);
    setError(null);
    try {
      const res = await fetch(meta.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          kind === "escutar"
            ? { topic: topic || undefined, cefr }
            : mode === "serie" && seriesTitle
              ? { seriesTitle, level: cefr }
              : { level: cefr, theme: topic || undefined }
        ),
      });
      const data = (await res.json()) as { id?: number; error?: string };
      if (!res.ok || !data.id) throw new Error(data.error);
      router.push(`${meta.base}/${data.id}${carry}`);
    } catch (e) {
      setError(
        e instanceof Error && e.message
          ? e.message
          : "A Sandra não conseguiu criar isto agora. Tenta outra vez."
      );
      setBusy(null);
    }
  }

  const working = busy !== null;

  return (
    <section className="card space-y-3 p-4">
      <div>
        <h2 className="font-semibold">
          {meta.emoji} {tone === "quiet" ? "Ou faz um novo" : "Feito à medida"}
        </h2>
        <p className="mt-0.5 text-sm text-ink-soft">
          {topic ? (
            <>
              Sobre <strong className="text-ink">«{topic}»</strong> — o tema
              desta unidade.{" "}
            </>
          ) : (
            <>Sobre o tema desta unidade. </>
          )}
          <span className="text-ink-faint">
            One tap — the topic and the unit come with it.
          </span>
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="label" htmlFor={`unit-start-${kind}`}>
            Nível
          </label>
          <select
            id={`unit-start-${kind}`}
            value={cefr}
            onChange={(e) => setCefr(e.target.value)}
            className="input"
            disabled={!enabled || working}
          >
            {LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
        <button
          className={cn(
            "max-w-full",
            tone === "primary" ? "btn-primary" : "btn-terra"
          )}
          disabled={!enabled || working}
          onClick={() => void create("novo")}
        >
          {busy === "novo" ? (
            <Bi pt="A Sandra está a criar…" en="Sandra is creating it…" inline />
          ) : (
            <Bi
              pt={`${meta.emoji} ${meta.newLabel} ${topic ? `«${short(topic)}»` : "esta unidade"} ✨`}
              en={`${meta.newLabelEn} ${topic ? `"${short(topic)}"` : "this unit"}`}
              inline
            />
          )}
        </button>
        {kind === "story" && seriesTitle ? (
          <button
            className="btn-ghost max-w-full"
            disabled={working}
            onClick={() => void create("serie")}
          >
            {busy === "serie" ? (
              <Bi pt="A Sandra está a escrever…" en="Sandra is writing it…" inline />
            ) : (
              <Bi
                pt={`Próximo capítulo de «${short(seriesTitle, 32)}»`}
                en={`Next chapter of "${short(seriesTitle, 32)}"`}
                inline
              />
            )}
          </button>
        ) : null}
      </div>

      {!enabled ? (
        <p className="text-xs text-ink-faint">
          As vozes pt-PT ainda não estão ligadas — só dá para ouvir o que já
          está gravado.
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl bg-terra-pale px-3 py-2 text-sm text-terra-dark">
          {error}
        </p>
      ) : null}
    </section>
  );
}
