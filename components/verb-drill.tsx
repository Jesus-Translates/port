"use client";

import { useMemo, useState } from "react";
import { UnitContinue } from "@/components/unit-return";
import { completeItem } from "@/lib/actions/course";
import { finishVerbRound } from "@/lib/actions/verbos";
import type { UnitContext } from "@/lib/unit-context";
import {
  PERSONS,
  TENSE_LABEL,
  personLabel,
  type Tense,
  type Verb,
  verbsWithTense,
} from "@/lib/verbs";
import { cn } from "@/lib/utils";

const ROUND = 10;

type Q = { prompt: string; answer: string; verb: string; en: string };

function stripAccents(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** How much of a round a topic's own verbs get, when it names any. */
const FOCUS_SHARE = 0.6;

/** Draw distinct questions from `pool` until `qs` reaches `target`. */
function draw(
  qs: Q[],
  seen: Set<string>,
  pool: Verb[],
  tenses: Tense[],
  target: number
) {
  if (pool.length === 0) return;
  let guard = 0;
  while (qs.length < target && guard++ < 200) {
    const verb = pool[Math.floor(Math.random() * pool.length)];
    const available = tenses.filter((t) => verb.forms[t]);
    const tense = available[Math.floor(Math.random() * available.length)];
    const p = Math.floor(Math.random() * PERSONS.length);
    // Some slots have no form at all (the imperative has no "eu") — skip them.
    const answer = verb.forms[tense]![p];
    if (!answer) continue;
    const key = `${verb.inf}|${tense}|${p}`;
    if (seen.has(key)) continue;
    seen.add(key);
    qs.push({
      prompt: `${personLabel(tense, p)} · ${verb.inf} · ${TENSE_LABEL[tense].toLowerCase()}`,
      answer,
      verb: verb.inf,
      en: verb.en,
    });
  }
}

function makeRound(tenses: Tense[], focus: string[] = []): Q[] {
  const all = verbsWithTense(tenses);
  const wanted = all.filter((v) => focus.includes(v.inf));
  const qs: Q[] = [];
  const seen = new Set<string>();
  // A step that names its verbs gets a round that is MOSTLY those verbs — but
  // never only them: two verbs in one tense offer ten distinct questions at
  // best, and a round that came up short would teach less than a mixed one.
  if (wanted.length > 0) draw(qs, seen, wanted, tenses, Math.ceil(ROUND * FOCUS_SHARE));
  draw(qs, seen, all, tenses, ROUND);
  return qs;
}

export function VerbDrill({
  initialTenses = [],
  focusVerbs = [],
  unit = null,
}: {
  /** Tenses the unit step asked for. Empty leaves the learner's own choice. */
  initialTenses?: Tense[];
  /** Infinitives the topic names, weighted up when the round is dealt. */
  focusVerbs?: string[];
  /** The unit path step this round is fulfilling, when there is one. */
  unit?: UnitContext | null;
}) {
  const [tenses, setTenses] = useState<Tense[]>(
    initialTenses.length > 0 ? initialTenses : ["perfeito"]
  );
  const [round, setRound] = useState<Q[] | null>(null);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [checked, setChecked] = useState<null | boolean>(null);
  const [results, setResults] = useState<{ q: Q; ok: boolean }[]>([]);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const q = round?.[index];
  const score = useMemo(() => results.filter((r) => r.ok).length, [results]);

  function toggleTense(t: Tense) {
    setTenses((cur) =>
      cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]
    );
  }

  function start() {
    if (tenses.length === 0) return;
    setRound(makeRound(tenses, focusVerbs));
    setIndex(0);
    setTyped("");
    setChecked(null);
    setResults([]);
    setDone(false);
  }

  function check() {
    if (!q || !typed.trim()) return;
    const ok = stripAccents(typed) === stripAccents(q.answer);
    setChecked(ok);
    setResults((r) => [...r, { q, ok }]);
  }

  async function next() {
    if (!round) return;
    if (index === round.length - 1) {
      setDone(true);
      setSaving(true);
      const misses = results
        .filter((r) => !r.ok)
        .map((r) => ({ prompt: r.q.prompt, answer: r.q.answer }));
      // The round IS the step — tick it off here, defensively, so a failed
      // tick can never cost the learner the round they just finished.
      if (unit?.itemId) {
        const pct = Math.round((score / Math.max(round.length, 1)) * 100);
        void completeItem(unit.itemId, pct).catch(() => {});
      }
      await finishVerbRound(score, round.length, misses);
      setSaving(false);
    } else {
      setIndex((i) => i + 1);
      setTyped("");
      setChecked(null);
    }
  }

  if (!round || done) {
    return (
      <div className="space-y-4">
        {done && round ? (
          <div className="card p-6 text-center">
            <div className="mb-2 text-4xl" aria-hidden>
              {score >= 8 ? "🏆" : score >= 5 ? "💪" : "🌱"}
            </div>
            <p className="font-display text-2xl font-semibold">
              {score}/{round.length}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {saving
                ? "A guardar…"
                : score === round.length
                  ? "Conjugação impecável!"
                  : "Os erros foram para o teu baralho de revisão."}
            </p>
            {/* Came from a unit? The way onward is back to the course. */}
            {unit ? (
              <div className="mt-5">
                <UnitContinue unit={unit} />
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="card space-y-3 p-5">
          <span className="label">Tempos verbais</span>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TENSE_LABEL) as Tense[]).map((t) => (
              <button
                key={t}
                onClick={() => toggleTense(t)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  tenses.includes(t)
                    ? "border-olive bg-olive text-paper"
                    : "border-sand bg-white/70 hover:border-sage"
                )}
              >
                {TENSE_LABEL[t]}
              </button>
            ))}
          </div>
          <button
            className="btn-terra w-full"
            onClick={start}
            disabled={tenses.length === 0}
          >
            {done ? "Outra ronda →" : "Começar (10 verbos)"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {round.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i < index
                ? results[i]?.ok
                  ? "bg-olive"
                  : "bg-terra"
                : i === index
                  ? "bg-azul"
                  : "bg-sand"
            )}
          />
        ))}
      </div>

      <div className="card p-6">
        <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
          {index + 1} de {round.length} · {q!.en}
        </p>
        <p className="mt-2 font-display text-2xl">{q!.prompt}</p>

        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (checked === null ? check : next)();
          }}
          disabled={checked !== null}
          className="input mt-4"
          placeholder="Escreve a forma…"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
        />

        {checked !== null ? (
          <p
            className={cn(
              "mt-3 rounded-xl px-3 py-2 text-sm",
              checked
                ? "bg-sage-pale text-olive"
                : "bg-terra-pale text-terra-dark"
            )}
          >
            {checked ? (
              <>Certo! ✓ {q!.answer}</>
            ) : (
              <>
                A forma certa é <strong className="font-display text-base">{q!.answer}</strong>
              </>
            )}
          </p>
        ) : null}
      </div>

      {checked === null ? (
        <button
          className="btn-terra w-full"
          onClick={check}
          disabled={!typed.trim()}
        >
          Corrigir ✓
        </button>
      ) : (
        <button className="btn-primary w-full" onClick={next}>
          {index === round.length - 1 ? "Terminar" : "Próximo →"}
        </button>
      )}
    </div>
  );
}
