"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", emoji: "🏠", label: "Início" },
  { href: "/tutor", emoji: "🌙", label: "Luna" },
  { href: "/reference", emoji: "📖", label: "Livro" },
  { href: "/workbook", emoji: "📚", label: "Lições" },
  { href: "/homework", emoji: "✍️", label: "TPC" },
  { href: "/practice", emoji: "🎯", label: "Praticar" },
  { href: "/notes", emoji: "📝", label: "Notas" },
];

export function Nav({ displayName }: { displayName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-sand bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-1.5 shrink-0">
          <span className="font-display text-xl font-semibold tracking-tight">
            Português
          </span>
          <span className="hidden text-xs text-ink-faint sm:inline">
            · Santa Cruz
          </span>
        </Link>
        <div className="min-w-0 flex-1" />
        <span className="chip shrink-0">
          {displayName === "Kelly" ? "👩‍🏫" : "🌊"} {displayName}
        </span>
        <button
          onClick={logout}
          className="shrink-0 text-xs text-ink-soft underline-offset-2 hover:text-terra hover:underline"
        >
          Sair
        </button>
      </div>
      <nav className="mx-auto max-w-5xl overflow-x-auto px-2 pb-2 [scrollbar-width:none]">
        <ul className="flex gap-1 whitespace-nowrap">
          {TABS.map((t) => {
            const active =
              t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-olive text-paper"
                      : "text-ink-soft hover:bg-sage-pale hover:text-ink"
                  )}
                >
                  <span aria-hidden>{t.emoji}</span>
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
