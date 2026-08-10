"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export type MarkdownProps = {
  /** Markdown source (GitHub-flavoured). Rendered into `.prose-basic`. */
  children: string;
  className?: string;
};

/** Renders Markdown from Sandra and from unit notes, styled to match the app. */
export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={cn("prose-basic", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
