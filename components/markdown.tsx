"use client";

import { Children, cloneElement, createContext, isValidElement, useContext } from "react";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AudioButton } from "@/components/audio-button";
import { hasEnglishWord, looksPortuguese } from "@/lib/lang-guard";
import { cn } from "@/lib/utils";

export type MarkdownProps = {
  /** Markdown source (GitHub-flavoured). Rendered into `.prose-basic`. */
  children: string;
  className?: string;
};

/**
 * The four headings every unit note uses, and what they mean.
 *
 * They are a CLOSED SET — the generator is told to use these exact strings and
 * nothing else — which is what makes a lookup honest here rather than a guess.
 * A beginner opening their first unit met "O que é" as a bare Portuguese
 * heading: the app was using Portuguese to label an explanation of Portuguese,
 * to somebody who by definition cannot read it yet.
 *
 * Glossing them here fixes every note ALREADY written, with no regeneration
 * and no model call. A heading outside this set gets neither gloss nor button,
 * because we cannot know what language it is in.
 */
const NOTE_HEADINGS: Record<string, string> = {
  "o que é": "What this is",
  "como funciona": "How it works",
  "na vida real": "In real life",
  "erros comuns": "Common mistakes",
};

/** Flatten a hast node to its plain text — what the speech endpoint needs. */
function hastText(node: unknown): string {
  const n = node as { value?: string; children?: unknown[] } | undefined;
  if (!n) return "";
  if (typeof n.value === "string") return n.value;
  if (Array.isArray(n.children)) return n.children.map(hastText).join("");
  return "";
}

/** Which column of the current table holds Portuguese, or -1. */
const PtColumn = createContext(-1);

/**
 * True inside something that ALREADY has a speak button.
 *
 * The Portuguese column of a note's table is usually bold — "**Bom dia.**" —
 * so the cell and the bold run inside it would each sprout a button for the
 * same words. One phrase, one button.
 */
const AlreadySpoken = createContext(false);

/**
 * One table cell, speaking only if it sits in the Portuguese column.
 *
 * A component rather than an inline render function because it reads context,
 * and a hook may only be called from a real component.
 */
function TableCell({
  col,
  text,
  children,
}: {
  col?: number;
  text: string;
  children: ReactNode;
}) {
  const ptCol = useContext(PtColumn);
  // Speak the Portuguese COLUMN — decided by the table's own header, not by
  // guessing at the words. "Bom dia." carries no diacritic and would be
  // indistinguishable from English by content alone.
  /*
   * Right column AND no English in the cell.
   *
   * The column is the primary signal — "Bom dia." has no diacritic and cannot
   * be identified by content. But some cells carry their own translation
   * ("Faz calor. It is hot."), and reading that aloud in a Portuguese voice is
   * exactly what this is all meant to avoid. When a cell is mixed we stay
   * quiet rather than speak half of it wrong.
   */
  const speak =
    col !== undefined &&
    col === ptCol &&
    text.length > 0 &&
    !hasEnglishWord(text);
  if (!speak) return <td>{children}</td>;
  return (
    <td>
      <span className="inline-flex items-center gap-1.5">
        <AlreadySpoken.Provider value>
          <span>{children}</span>
        </AlreadySpoken.Provider>
        <AudioButton text={text} className="shrink-0" />
      </span>
    </td>
  );
}

/*
 * A header naming the Portuguese column. Matched loosely on purpose: real
 * notes head these columns "Portuguese", "European Portuguese", "Português",
 * "Frase" and more, and an exact match found only the first of those — so
 * whole tables of vocabulary sat silent.
 */
const PT_HEADER = /portugu|^\s*pt\s*$|frase|express/i;

/** Find the Portuguese column from a table's header row. */
function portugueseColumn(node: unknown): number {
  const rows: unknown[] = [];
  const walk = (x: unknown) => {
    const el = x as { tagName?: string; children?: unknown[] };
    if (!el) return;
    if (el.tagName === "tr") rows.push(el);
    else el.children?.forEach(walk);
  };
  walk(node);
  const header = rows[0] as { children?: unknown[] } | undefined;
  if (!header?.children) return -1;
  const cells = header.children.filter(
    (c) => (c as { tagName?: string }).tagName === "th"
  );
  const idx = cells.findIndex((c) => PT_HEADER.test(hastText(c)));
  return idx;
}

/** Renders Markdown from Sandra and from unit notes, styled to match the app. */
export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={cn("prose-basic", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2({ node, children: kids }) {
            const text = hastText(node).trim();
            const en = NOTE_HEADINGS[text.toLowerCase()];
            if (!en) return <h2>{kids}</h2>;
            return (
              <h2>
                <span className="inline-flex flex-wrap items-baseline gap-x-2">
                  <span>{kids}</span>
                  {/* The English is the point of the gloss, so it is readable
                      rather than a footnote — but still clearly secondary. */}
                  <span className="text-[0.6em] font-normal text-ink-faint">
                    {en}
                  </span>
                  <AudioButton text={text} className="shrink-0 align-middle" />
                </span>
              </h2>
            );
          },

          table({ node, children: kids }) {
            return (
              <PtColumn.Provider value={portugueseColumn(node)}>
                <table>{kids}</table>
              </PtColumn.Provider>
            );
          },

          // Cells do not know their own position, so the row hands it to them.
          tr({ children: kids }) {
            return (
              <tr>
                {Children.map(kids, (child, i) =>
                  isValidElement<{ "data-col"?: number }>(child)
                    ? cloneElement(child, { "data-col": i })
                    : child
                )}
              </tr>
            );
          },

          td({ node, children: kids, ...rest }) {
            return (
              <TableCell
                col={(rest as { "data-col"?: number })["data-col"]}
                text={hastText(node).trim()}
              >
                {kids}
              </TableCell>
            );
          },

          strong: ({ node, children: kids }) => (
            <BoldPhrase text={hastText(node).trim()}>{kids}</BoldPhrase>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

/** A bold run, with a speak button when it is a short Portuguese phrase. */
function BoldPhrase({ text, children }: { text: string; children: ReactNode }) {
  const already = useContext(AlreadySpoken);
  /*
   * Bold is the app's convention for a Portuguese phrase inside an English
   * explanation — "Use **olá** at any time of day". So bold is where the
   * hearable phrases are.
   *
   * Gated on looksPortuguese, because bold is also plain emphasis in English
   * prose, and a Portuguese voice reading an English word is worse than no
   * button. Long runs are skipped too: a bolded sentence is a heading in
   * disguise, not a phrase to repeat.
   */
  const speak =
    !already && text.length > 1 && text.length <= 60 && looksPortuguese(text);
  if (!speak) return <strong>{children}</strong>;
  return (
    <span className="inline-flex items-baseline gap-1">
      <strong>{children}</strong>
      <AudioButton text={text} className="shrink-0 align-middle" />
    </span>
  );
}
