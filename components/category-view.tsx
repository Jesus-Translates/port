"use client";

import { useMemo, useState, useTransition } from "react";
import { AudioButton } from "@/components/audio-button";
import {
  addEntries,
  addEntry,
  deleteEntry,
  type NewEntry,
} from "@/lib/actions/reference";
import { cn } from "@/lib/utils";

type Entry = {
  id: number;
  kind: string;
  section: string;
  pt: string;
  en: string;
  replyPt: string | null;
  replyEn: string | null;
  note: string | null;
  addedBy: string;
};

const KIND_ORDER = ["term", "verb", "phrase", "task"];

export function CategoryView({
  category,
  entries,
}: {
  category: { id: number; slug: string; namePt: string; nameEn: string };
  entries: Entry[];
}) {
  const [filter, setFilter] = useState("");
  const [showEn, setShowEn] = useState(true);
  const [adding, setAdding] = useState(false);
  const [pending, startTransition] = useTransition();

  // AI suggestions state
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<NewEntry[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const sections = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const filtered = q
      ? entries.filter(
          (e) =>
            e.pt.toLowerCase().includes(q) ||
            e.en.toLowerCase().includes(q) ||
            (e.note ?? "").toLowerCase().includes(q)
        )
      : entries;
    const map = new Map<string, Entry[]>();
    const sorted = [...filtered].sort(
      (a, b) =>
        KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || a.id - b.id
    );
    for (const e of sorted) {
      const list = map.get(e.section) ?? [];
      list.push(e);
      map.set(e.section, list);
    }
    return [...map.entries()];
  }, [entries, filter]);

  async function fetchSuggestions() {
    setSuggesting(true);
    try {
      const res = await fetch("/api/ai/reference-fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: category.id }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSuggestions(data.entries);
      setSelected(new Set(data.entries.map((_: NewEntry, i: number) => i)));
    } catch {
      setSuggestions(null);
      alert("A Sandra não respondeu. Tenta outra vez.");
    } finally {
      setSuggesting(false);
    }
  }

  function acceptSelected() {
    if (!suggestions) return;
    const chosen = suggestions.filter((_, i) => selected.has(i));
    startTransition(async () => {
      await addEntries(category.id, category.slug, chosen);
      setSuggestions(null);
    });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={`Procurar em ${category.namePt}…`}
          className="input sm:max-w-xs"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="btn-ghost text-xs"
            onClick={() => setShowEn((s) => !s)}
          >
            {showEn ? "Esconder inglês" : "Mostrar inglês"}
          </button>
          <div className="hidden flex-1 sm:block" />
          <button className="btn-ghost" onClick={() => setAdding((a) => !a)}>
            + Adicionar
          </button>
          <button
            className="btn-terra"
            onClick={fetchSuggestions}
            disabled={suggesting}
          >
            {suggesting ? "A Sandra está a escrever…" : "✨ Sandra, dá-nos mais"}
          </button>
        </div>
      </div>

      {adding ? (
        <EntryForm
          onSubmit={(entry) =>
            startTransition(async () => {
              await addEntry(category.id, category.slug, entry);
              setAdding(false);
            })
          }
          busy={pending}
          onCancel={() => setAdding(false)}
        />
      ) : null}

      {suggestions ? (
        <div className="card border-terra/40 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold">Sugestões da Sandra</h3>
            <div className="flex gap-2">
              <button
                className="btn-primary text-xs"
                disabled={pending || selected.size === 0}
                onClick={acceptSelected}
              >
                {pending
                  ? "A adicionar…"
                  : `Adicionar ${selected.size} ao livro`}
              </button>
              <button
                className="btn-ghost text-xs"
                onClick={() => setSuggestions(null)}
              >
                Fechar
              </button>
            </div>
          </div>
          <ul className="divide-y divide-sand/70">
            {suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-3 py-2">
                <input
                  type="checkbox"
                  checked={selected.has(i)}
                  onChange={(e) => {
                    const next = new Set(selected);
                    if (e.target.checked) next.add(i);
                    else next.delete(i);
                    setSelected(next);
                  }}
                  className="mt-1.5 accent-olive"
                />
                <div>
                  <span className="font-medium">{s.pt}</span>
                  <span className="text-ink-soft"> — {s.en}</span>
                  {s.replyPt ? (
                    <div className="text-sm text-ink-soft">
                      ↳ {s.replyPt}
                      {s.replyEn ? ` — ${s.replyEn}` : ""}
                    </div>
                  ) : null}
                  <span className="ml-2 align-middle text-2xs text-ink-faint uppercase">
                    {s.section}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {sections.length === 0 ? (
        <p className="card p-6 text-center text-sm text-ink-soft">
          {filter
            ? "Nada encontrado. (Nothing matches.)"
            : "Ainda não há entradas — adiciona a primeira!"}
        </p>
      ) : null}

      {sections.map(([section, items]) => (
        <section key={section} className="card overflow-hidden">
          <h3 className="border-b border-sand bg-sage-pale/60 px-4 py-2 text-xs font-bold tracking-widest text-olive uppercase">
            {section}
          </h3>
          <ul className="divide-y divide-sand/60">
            {items.map((e) => (
              <li key={e.id} className="group flex items-start gap-3 px-4 py-2.5">
                <span
                  className={cn(
                    "mt-1 shrink-0 text-xs",
                    e.kind === "verb" && "text-azul",
                    e.kind === "phrase" && "text-terra",
                    e.kind === "task" && "text-olive"
                  )}
                  title={e.kind}
                  aria-hidden
                >
                  {e.kind === "verb"
                    ? "⚡"
                    : e.kind === "phrase"
                      ? "💬"
                      : e.kind === "task"
                        ? "✔︎"
                        : "•"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-medium">{e.pt}</span>
                    <AudioButton
                      text={e.replyPt ? `${e.pt} … ${e.replyPt}` : e.pt}
                      className="min-h-7 min-w-7 scale-90 px-1.5"
                    />
                    {showEn ? (
                      <span className="text-sm text-ink-soft">{e.en}</span>
                    ) : null}
                  </div>
                  {e.replyPt ? (
                    <div className="mt-0.5 text-sm text-ink-soft">
                      ↳ {e.replyPt}
                      {showEn && e.replyEn ? (
                        <span className="text-ink-faint"> — {e.replyEn}</span>
                      ) : null}
                    </div>
                  ) : null}
                  {e.note ? (
                    <div className="mt-0.5 text-xs text-ink-faint italic">
                      {e.note}
                    </div>
                  ) : null}
                </div>
                {e.addedBy !== "seed" ? (
                  <span className="chip mt-0.5 shrink-0 capitalize">
                    {e.addedBy}
                  </span>
                ) : null}
                <button
                  title="Apagar"
                  aria-label={`Apagar ${e.pt}`}
                  className="touch-visible -m-1 mt-0 shrink-0 p-1 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100 hover:text-terra"
                  onClick={() => {
                    if (confirm(`Apagar “${e.pt}”?`)) {
                      startTransition(() => deleteEntry(e.id, category.slug));
                    }
                  }}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function EntryForm({
  onSubmit,
  onCancel,
  busy,
}: {
  onSubmit: (e: NewEntry) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [kind, setKind] = useState("term");
  const [section, setSection] = useState("");
  const [pt, setPt] = useState("");
  const [en, setEn] = useState("");
  const [replyPt, setReplyPt] = useState("");
  const [replyEn, setReplyEn] = useState("");
  const [note, setNote] = useState("");

  return (
    <form
      className="card space-y-3 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ kind, section, pt, en, replyPt, replyEn, note });
      }}
    >
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="label">Tipo</label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="input"
          >
            <option value="term">Palavra (term)</option>
            <option value="verb">Verbo</option>
            <option value="phrase">Frase</option>
            <option value="task">Tarefa</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="label">Secção</label>
          <input
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="input"
            placeholder="Utensílios"
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Português</label>
          <input
            value={pt}
            onChange={(e) => setPt(e.target.value)}
            className="input"
            placeholder="a varinha mágica"
            required
          />
        </div>
        <div>
          <label className="label">English</label>
          <input
            value={en}
            onChange={(e) => setEn(e.target.value)}
            className="input"
            placeholder="the hand blender"
            required
          />
        </div>
      </div>
      {kind === "phrase" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Resposta (pt, opcional)</label>
            <input
              value={replyPt}
              onChange={(e) => setReplyPt(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Reply (en, optional)</label>
            <input
              value={replyEn}
              onChange={(e) => setReplyEn(e.target.value)}
              className="input"
            />
          </div>
        </div>
      ) : null}
      <div>
        <label className="label">Nota (optional)</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="input"
          placeholder="usage tip, pt-PT vs pt-BR…"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "A guardar…" : "Guardar no livro"}
        </button>
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
