"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { avatarFor } from "@/lib/people";
import { cn } from "@/lib/utils";

/**
 * Five tabs, ~75px each on a phone instead of eight at ~47px.
 *
 * Livro, Lições, TPC and Notas are not gone — they live one tap inside
 * Explorar. Eight equally-weighted tabs made every session start with a
 * decision; this makes the guided path the obvious thing and everything else
 * findable in one place.
 */
const TABS = [
  { href: "/", emoji: "🏠", label: "Hoje", short: "Hoje" },
  { href: "/unidades", emoji: "🎓", label: "Curso", short: "Curso" },
  { href: "/practice", emoji: "🧭", label: "Explorar", short: "Explorar" },
  { href: "/tutor", emoji: "🌙", label: "Luna", short: "Luna" },
  { href: "/familia", emoji: "🏆", label: "Família", short: "Família" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Nav({
  displayName,
  spendSlot,
  showPanel = false,
}: {
  displayName: string;
  /** Server-rendered spend chip, streamed in via Suspense from the layout. */
  spendSlot?: React.ReactNode;
  /** Admin/teacher only. */
  showPanel?: boolean;
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
            href="/practice/rever?flash=1"
            title="Flash review — 5 cartões rápidos"
            className="shrink-0 rounded-full border border-sand bg-white/70 px-2 py-0.5 text-xs text-ink-soft transition-colors hover:border-terra hover:bg-terra-pale"
          >
            ⚡
          </Link>
          {showPanel ? (
            <Link
              href="/admin"
              title="Painel"
              className="shrink-0 rounded-full border border-sand bg-white/70 px-2 py-0.5 text-xs text-ink-soft transition-colors hover:border-sage hover:bg-sage-pale"
            >
              ⚙️
            </Link>
          ) : null}
          <Link
            href="/gastos"
            title="O teu gasto de IA este mês"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-sage-pale px-2.5 py-0.5 transition-colors hover:bg-sage-light"
          >
            <span className="text-xs font-medium text-olive">
              {avatarFor(displayName)} {displayName}
            </span>
            {spendSlot}
          </Link>
          <button
            onClick={logout}
            className="flex min-h-11 shrink-0 items-center px-2 text-xs text-ink-soft underline-offset-2 hover:text-terra hover:underline"
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
                      "text-[10px] leading-tight",
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
