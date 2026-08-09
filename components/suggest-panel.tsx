"use client";

import Link from "next/link";
import { useState } from "react";

type Suggestion = {
  title: string;
  reason: string;
  kind: "quiz" | "lesson" | "reference" | "tutor" | "homework";
  param: string;
};

const KIND_META: Record<Suggestion["kind"], { emoji: string; href: (p: string) => string }> = {
  quiz: { emoji: "🎯", href: (p) => `/practice?topic=${encodeURIComponent(p)}` },
  lesson: { emoji: "📚", href: (p) => `/workbook?topic=${encodeURIComponent(p)}` },
  reference: { emoji: "📖", href: (p) => `/reference/${encodeURIComponent(p)}` },
  tutor: { emoji: "🌙", href: (p) => `/tutor?q=${encodeURIComponent(p)}` },
  homework: { emoji: "✍️", href: (p) => `/homework?topic=${encodeURIComponent(p)}` },
};

export function SuggestPanel() {
  const [loading, setLoading] = useState(false);
  const [greeting, setGreeting] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchSuggestions() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/suggest", { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGreeting(data.greetingPt);
      setSuggestions(data.suggestions);
    } catch {
      setError("A Sandra não respondeu. Tenta outra vez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">O que estudar hoje?</h2>
          <p className="text-sm text-ink-soft">
            Sandra looks at what you&apos;ve been doing and suggests next steps.
          </p>
        </div>
        <button
          onClick={fetchSuggestions}
          disabled={loading}
          className="btn-terra"
        >
          {loading ? "A Sandra está a pensar…" : suggestions ? "Outra vez 🌙" : "Pergunta à Sandra 🌙"}
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-terra-dark">{error}</p> : null}
      {greeting ? (
        <p className="mt-4 rounded-xl bg-sage-pale px-3 py-2 text-sm text-olive">
          {greeting}
        </p>
      ) : null}
      {suggestions ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {suggestions.map((s, i) => (
            <Link
              key={i}
              href={(KIND_META[s.kind] ?? KIND_META.tutor).href(s.param)}
              className="group rounded-xl border border-sand bg-white/70 p-4 transition-all hover:border-sage hover:shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden>
                  {(KIND_META[s.kind] ?? KIND_META.tutor).emoji}
                </span>
                <div>
                  <div className="font-semibold group-hover:text-olive">
                    {s.title}
                  </div>
                  <div className="mt-0.5 text-sm text-ink-soft">{s.reason}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
