"use client";

import { useMemo, useState, useTransition } from "react";
import { deleteCards, masterCard, unmasterCard } from "@/lib/actions/deck";
import { cn } from "@/lib/utils";

export type DeckRow = {
  id: number;
  kind: string;
  front: string;
  back: string;
  state: number;
  /** Due more than a year out = retired by hand. Computed on the server so
   *  render stays pure (no clock reads during render). */
  mastered: boolean;
};

const KINDS: { key: string; label: string }[] = [
  { key: "all", label: "todos" },
  { key: "entry", label: "livro" },
  { key: "mistake", label: "erros" },
  { key: "saved", label: "guardados" },
  { key: "story", label: "histórias" },
  { key: "verb", label: "verbos" },
];

/** Rendering thousands of rows makes the page crawl — page the list instead. */
const MAX_VISIBLE = 400;

export function DeckManage({ rows }: { rows: DeckRow[] }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [pending, startTransition] = useTransition();
  // Layered over the server data so the list reacts instantly, without
  // going stale when the route revalidates.
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const [mastery, setMastery] = useState<Map<number, boolean>>(new Map());

  const live = useMemo(
    () => rows.filter((r) => !removed.has(r.id)),
    [rows, removed]
  );

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of live) m.set(r.kind, (m.get(r.kind) ?? 0) + 1);
    m.set("all", live.length);
    return m;
  }, [live]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return live.filter(
      (r) =>
        (kind === "all" || r.kind === kind) &&
        (!q ||
          r.front.toLowerCase().includes(q) ||
          r.back.toLowerCase().includes(q))
    );
  }, [live, kind, query]);

  const visible = filtered.slice(0, MAX_VISIBLE);
  const allVisibleSelected =
    visible.length > 0 && visible.every((r) => selected.has(r.id));

  function isMastered(r: DeckRow): boolean {
    return mastery.get(r.id) ?? r.mastered;
  }

  function toggle(id: number) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function master(ids: number[]) {
    if (ids.length === 0) return;
    setMastery((m) => {
      const next = new Map(m);
      for (const id of ids) next.set(id, true);
      return next;
    });
    startTransition(async () => {
      for (const id of ids) await masterCard(id);
      setSelected(new Set());
    });
  }

  function unmaster(id: number) {
    setMastery((m) => new Map(m).set(id, false));
    startTransition(() => unmasterCard(id));
  }

  function remove(ids: number[]) {
    if (ids.length === 0) return;
    const n = ids.length;
    if (
      !confirm(
        n === 1
          ? "Remover este cartão do baralho?"
          : `Remover ${n} cartões do baralho?`
      )
    ) {
      return;
    }
    setRemoved((r) => {
      const next = new Set(r);
      for (const id of ids) next.add(id);
      return next;
    });
    setSelected(new Set());
    startTransition(async () => {
      await deleteCards(ids);
    });
  }

  return (
    <div className="space-y-4">
      <section className="card space-y-3 p-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Procurar no baralho… (search front or back)"
          className="input"
        />
        <div className="flex flex-wrap gap-1.5">
          {KINDS.map((k) => {
            const n = counts.get(k.key) ?? 0;
            if (n === 0 && k.key !== "all" && k.key !== kind) return null;
            return (
              <button
                key={k.key}
                onClick={() => setKind(k.key)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors",
                  kind === k.key
                    ? "border-sage bg-sage-pale font-medium text-olive"
                    : "border-sand bg-white/70 text-ink-soft hover:border-sage hover:bg-sage-pale"
                )}
              >
                {k.label} <span className="text-ink-faint">{n}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <button
          className="btn-ghost text-xs"
          onClick={() =>
            setSelected(
              allVisibleSelected ? new Set() : new Set(visible.map((r) => r.id))
            )
          }
          disabled={visible.length === 0}
        >
          {allVisibleSelected ? "Desmarcar tudo" : "Marcar tudo"}
        </button>
        <span className="text-xs text-ink-faint">
          {selected.size > 0
            ? `${selected.size} selecionados`
            : `${filtered.length} cartões`}
        </span>
        <div className="ml-auto flex gap-2">
          <button
            className="btn-ghost text-xs"
            disabled={pending || selected.size === 0}
            onClick={() => master([...selected])}
          >
            Já domino ✓
          </button>
          <button
            className="btn-ghost text-xs text-terra-dark"
            disabled={pending || selected.size === 0}
            onClick={() => remove([...selected])}
          >
            Remover
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="mb-2 text-3xl" aria-hidden>
            🔍
          </div>
          <p className="text-sm text-ink-soft">
            Nenhum cartão com esse filtro.
          </p>
        </div>
      ) : (
        <ul className="card divide-y divide-sand overflow-hidden">
          {visible.map((r) => {
            const mastered = isMastered(r);
            const checked = selected.has(r.id);
            return (
              <li
                key={r.id}
                className={cn(
                  "flex items-start gap-3 p-3",
                  checked && "bg-sage-pale/40"
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(r.id)}
                  aria-label={`Selecionar ${r.front}`}
                  className="mt-1 h-4 w-4 shrink-0 accent-olive"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px]">
                    <span className="text-ink-soft">{r.front}</span>
                    <span className="mx-1.5 text-ink-faint" aria-hidden>
                      →
                    </span>
                    <span className="font-display font-medium">{r.back}</span>
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="chip bg-cream text-ink-soft">{r.kind}</span>
                    {mastered ? (
                      <span className="chip">dominado ✓</span>
                    ) : r.state === 0 ? (
                      <span className="chip bg-azul-pale text-azul">novo</span>
                    ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    title={mastered ? "Voltar a rever" : "Já domino"}
                    className="rounded-lg border border-sand bg-white/70 px-2 py-1 text-xs hover:border-sage hover:bg-sage-pale"
                    disabled={pending}
                    onClick={() => (mastered ? unmaster(r.id) : master([r.id]))}
                  >
                    {mastered ? "↺" : "✓"}
                  </button>
                  <button
                    title="Remover do baralho"
                    className="rounded-lg border border-sand bg-white/70 px-2 py-1 text-xs text-terra-dark hover:border-terra hover:bg-terra-pale"
                    disabled={pending}
                    onClick={() => remove([r.id])}
                  >
                    ✕
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {filtered.length > visible.length ? (
        <p className="text-center text-xs text-ink-faint">
          A mostrar {visible.length} de {filtered.length} — usa a pesquisa para
          encontrar o resto.
        </p>
      ) : null}
    </div>
  );
}
