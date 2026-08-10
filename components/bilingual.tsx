"use client";

import { createContext, useContext } from "react";
import { cn } from "@/lib/utils";

/**
 * English beside the Portuguese, when the family asks for it.
 *
 * Households are mixed: one parent reads Portuguese comfortably and the other
 * is guessing at every button. Bilingual mode is for the second one — the
 * interface stays Portuguese, with the English underneath rather than instead,
 * so nobody is learning from an English app with Portuguese content.
 *
 * A context rather than a prop threaded through forty components, and read
 * once in the app layout so it costs one query per request rather than one
 * per label.
 */
const BilingualContext = createContext(false);

export function BilingualProvider({
  value,
  children,
}: {
  value: boolean;
  children: React.ReactNode;
}) {
  return (
    <BilingualContext.Provider value={value}>
      {children}
    </BilingualContext.Provider>
  );
}

export function useBilingual(): boolean {
  return useContext(BilingualContext);
}

/**
 * A label in Portuguese, with its English underneath when bilingual is on.
 *
 * `inline` puts the English on the same line in parentheses — for buttons and
 * chips, where a second line would break the layout.
 */
export function Bi({
  pt,
  en,
  inline = false,
  className,
  enClassName,
}: {
  pt: React.ReactNode;
  en: string;
  /** Same line, in muted parentheses. Use inside buttons and chips. */
  inline?: boolean;
  className?: string;
  enClassName?: string;
}) {
  const on = useBilingual();
  if (!on) return <span className={className}>{pt}</span>;

  if (inline) {
    return (
      <span className={className}>
        {pt}{" "}
        <span className={cn("font-normal opacity-60", enClassName)}>({en})</span>
      </span>
    );
  }
  return (
    <span className={cn("block", className)}>
      {pt}
      <span
        className={cn(
          "mt-0.5 block text-xs font-normal text-ink-faint",
          enClassName
        )}
      >
        {en}
      </span>
    </span>
  );
}
