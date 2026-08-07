"use client";

import { useMemo, useState } from "react";
import { finishVerbRound } from "@/lib/actions/verbos";
import {
  PERSONS,
  TENSE_LABEL,
  type Tense,
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

function makeRound(tenses: Tense[]): Q[] {
  const pool = verbsWithTense(tenses);
  const qs: Q[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (qs.length < ROUND && guard++ < 200) {
    const verb = pool[Math.floor(Math.random() * pool.length)];
    const available = tenses.filter((t) => verb.forms[t]);
    const tense = available[Math.floor(Math.random() * available.length)];
    const p = Math.floor(Math.random() * PERSONS.length);
    const key = `${verb.inf}|${tense}|${p}`;
    if (seen.has(key)) continue;
    seen.add(key);
    qs.push({
      prompt: `${PERSONS[p]} · ${verb.inf} · ${TENSE_LABEL[tense].toLowerCase()}`,
      answer: verb.forms[tense]![p],
      verb: verb.inf,
      en: verb.en,
    });
  }
  return qs;
}

export function VerbDrill() {
  const [tenses, setTenses] = useState<Tense[]>(["perfeito"]);
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
    setRound(makeRound(tenses));
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
