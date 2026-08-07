"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { avatarFor } from "@/lib/people";
import { cn } from "@/lib/utils";

// `short` keeps 8 tabs legible in the phone bottom bar (~47px each).
const TABS = [
  { href: "/", emoji: "🏠", label: "Início", short: "Início" },
  { href: "/tutor", emoji: "🌙", label: "Luna", short: "Luna" },
  { href: "/reference", emoji: "📖", label: "Livro", short: "Livro" },
  { href: "/workbook", emoji: "📚", label: "Lições", short: "Lições" },
  { href: "/homework", emoji: "✍️", label: "TPC", short: "TPC" },
  { href: "/practice", emoji: "🎯", label: "Praticar", short: "Testes" },
  { href: "/notes", emoji: "📝", label: "Notas", short: "Notas" },
  { href: "/familia", emoji: "🏆", label: "Família", short: "Família" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Nav({
  displayName,
  spendEur,
}: {
  displayName: string;
  spendEur?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-sand bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link href="/" className="flex shrink-0 items-baseline gap-1.5">
            <span className="font-display text-xl font-semibold tracking-tight">
              Português
            </span>
            <span className="hidden text-xs text-ink-faint sm:inline">
              · Santa Cruz
            </span>
          </Link>
          <div className="min-w-0 flex-1" />
          <Link
            href="/gastos"
            title="O teu gasto de IA este mês"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-sage-pale px-2.5 py-0.5 transition-colors hover:bg-sage-light"
          >
            <span className="text-xs font-medium text-olive">
              {avatarFor(displayName)} {displayName}
            </span>
            {spendEur ? (
              <span className="border-l border-sage/40 pl-1.5 text-[11px] font-semibold text-terra-dark tabular-nums">
                {spendEur}
              </span>
            ) : null}
          </Link>
          <button
            onClick={logout}
            className="shrink-0 p-1 text-xs text-ink-soft underline-offset-2 hover:text-terra hover:underline"
          >
            Sair
          </button>
        </div>

        {/* Desktop / tablet: pill row. On phones the bottom bar takes over. */}
        <nav className="mx-auto hidden max-w-5xl px-2 pb-2 sm:block">
          <ul className="flex flex-wrap gap-1">
            {TABS.map((t) => (
              <li key={t.href}>
                <Link
                  href={t.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                    isActive(pathname, t.href)
                      ? "bg-olive text-paper"
                      : "text-ink-soft hover:bg-sage-pale hover:text-ink"
                  )}
                >
                  <span aria-hidden>{t.emoji}</span>
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Phones: fixed bottom tab bar — every section one tap away, and it
          clears the iPhone home indicator via safe-area padding. */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-sand bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
        <ul className="flex items-stretch justify-between px-1">
          {TABS.map((t) => {
            const active = isActive(pathname, t.href);
            return (
              <li key={t.href} className="flex-1">
                <Link
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-lg px-px py-1.5 transition-colors",
                    active ? "text-olive" : "text-ink-faint"
                  )}
                >
                  <span
                    className={cn(
                      "text-lg leading-none transition-transform",
                      active && "scale-110"
                    )}
                    aria-hidden
                  >
                    {t.emoji}
                  </span>
                  <span
                    className={cn(
                      "text-[9px] leading-tight",
                      active && "font-semibold"
                    )}
                  >
                    {t.short}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
