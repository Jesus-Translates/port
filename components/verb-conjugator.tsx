"use client";

import { useState } from "react";
import { AudioButton } from "@/components/audio-button";
import {
  CLASS_LABEL,
  findVerb,
  isRegular,
  stripAccents,
  tensesOf,
  verbClass,
} from "@/lib/verb-filter";
import { cn } from "@/lib/utils";
import { personLabel, TENSE_LABEL, type Tense, VERBS } from "@/lib/verbs";

/**
 * Consultar — the full paradigm of one verb, every form with its own play
 * button, and the tenses where this verb breaks the pattern called out.
 */
export type VerbConjugatorProps = {
  /** Infinitive to open on, e.g. "falar". Defaults to "falar". */
  initialVerb?: string;
  /** Tense to filter to on open. Defaults to showing every tense. */
  initialTense?: Tense;
};

export function VerbConjugator({
  initialVerb,
  initialTense,
}: VerbConjugatorProps) {
  const [query, setQuery] = useState("");
  const [inf, setInf] = useState(initialVerb ?? "falar");
  const [only, setOnly] = useState<Tense | "todos">(initialTense ?? "todos");

  const q = stripAccents(query);
  const matches = q
    ? VERBS.filter(
        (v) => stripAccents(v.inf).includes(q) || v.en.toLowerCase().includes(q)
      )
    : VERBS;

  const verb = findVerb(inf);
  const tenses = verb ? tensesOf(verb) : [];
  // Switching verbs can strand the tense filter — plenty of verbs have no
  // imperativo or conjuntivo — so a filter this verb cannot honour falls back
  // to showing everything instead of rendering an empty page.
  const active = only !== "todos" && tenses.includes(only) ? only : "todos";
  const shown = active === "todos" ? tenses : tenses.filter((t) => t === active);
  const irregulars = verb ? tenses.filter((t) => !isRegular(verb, t)) : [];

  return (
    <div className="space-y-4">
      <div className="card space-y-3 p-4">
        <div>
          <label className="label" htmlFor="verbo-procurar">
            Procurar verbo
          </label>
          <input
            id="verbo-procurar"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input"
            placeholder="ex.: ficar · to stay · dorm"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
        {matches.length === 0 ? (
          <p className="text-sm text-ink-soft">
            Nenhum verbo com «{query}».{" "}
            <span className="text-ink-faint">No match — try the English.</span>
          </p>
        ) : (
          <div className="max-h-48 overflow-y-auto">
            <div className="flex flex-wrap gap-1.5 pr-1">
              {matches.map((v) => (
                <button
                  key={v.inf}
                  type="button"
                  onClick={() => setInf(v.inf)}
                  aria-pressed={v.inf === inf}
                  className={cn(
                    "min-h-11 rounded-full border px-3 py-1.5 text-sm transition-colors",
                    v.inf === inf
                      ? "border-olive bg-olive text-paper"
                      : "border-sand bg-white/70 hover:border-sage hover:bg-sage-pale"
                  )}
                >
                  {v.inf}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {!verb ? (
        <p className="card p-5 text-sm text-ink-soft">
          Escolhe um verbo em cima.
        </p>
      ) : (
        <>
          <div className="card space-y-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display text-3xl leading-tight font-semibold">
                  {verb.inf}
                </h2>
                <p className="mt-0.5 text-sm text-ink-soft">{verb.en}</p>
              </div>
              <AudioButton text={verb.inf} />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="chip">verbo em {CLASS_LABEL[verbClass(verb)]}</span>
              {irregulars.length === 0 ? (
                <span className="chip">regular em tudo</span>
              ) : (
                irregulars.map((t) => (
                  <span key={t} className="chip bg-terra-pale text-terra-dark">
                    {TENSE_LABEL[t]} irregular
                  </span>
                ))
              )}
            </div>
            <p className="text-xs text-ink-faint">
              Regularity is worked out by rebuilding the form from the
              infinitive — spelling shifts like <em>fiquei</em> and{" "}
              <em>comecei</em> still count as regular.
            </p>
          </div>

          {tenses.length > 1 ? (
            <div className="flex flex-wrap gap-1.5">
              {(["todos", ...tenses] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setOnly(t)}
                  aria-pressed={active === t}
                  className={cn(
                    "min-h-11 rounded-full border px-3 py-1.5 text-sm transition-colors",
                    active === t
                      ? "border-olive bg-olive text-paper"
                      : "border-sand bg-white/70 hover:border-sage hover:bg-sage-pale"
                  )}
                >
                  {t === "todos" ? "Todos os tempos" : TENSE_LABEL[t]}
                </button>
              ))}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            {shown.map((t) => {
              const forms = verb.forms[t] ?? [];
              const regular = isRegular(verb, t);
              const spoken = forms.filter(Boolean).join(", ");
              return (
                <section key={t} className="card overflow-hidden">
                  <header className="flex items-center justify-between gap-2 border-b border-sand bg-cream/60 px-4 py-2.5">
                    <div className="min-w-0">
                      <h3 className="font-display text-base font-semibold">
                        {TENSE_LABEL[t]}
                      </h3>
                      <p
                        className={cn(
                          "text-2xs",
                          regular ? "text-ink-faint" : "text-terra-dark"
                        )}
                      >
                        {regular ? "segue o padrão" : "irregular — decora esta"}
                      </p>
                    </div>
                    <AudioButton text={spoken} label="tudo" />
                  </header>
                  <ul className="divide-y divide-sand/60">
                    {forms.map((f, i) =>
                      f ? (
                        <li key={i} className="flex items-center gap-3 px-4 py-2">
                          <span className="w-16 shrink-0 text-xs text-ink-faint">
                            {personLabel(t, i)}
                          </span>
                          <span className="flex-1 font-display text-lg break-words">
                            {f}
                          </span>
                          <AudioButton text={f} />
                        </li>
                      ) : (
                        <li
                          key={i}
                          className="px-4 py-2 text-xs text-ink-faint italic"
                        >
                          não há imperativo para «eu»
                        </li>
                      )
                    )}
                  </ul>
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
