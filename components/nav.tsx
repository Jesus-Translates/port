"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconBook,
  IconChart,
  IconChat,
  IconHome,
  IconPeople,
} from "@/components/icons";
import { useBilingual } from "@/components/bilingual";
import { avatarFor } from "@/lib/people";
import { cn } from "@/lib/utils";

/**
 * Hoje · Palavras · Sandra · Progresso · Família.
 *
 * The O Caminho redesign retired the Curso and Praticar tabs. Neither surface
 * is gone: the course is now the calçada path ON Hoje, and Praticar's contents
 * are reached from the screen they belong to — vocabulary and review from
 * Palavras, games from Progresso, the rest from the "Tudo" link on Hoje.
 *
 * The rule this file has carried since 2026-08-10 still applies, and applies
 * doubly to a retab: if you demote a surface, LINK IT SOMEWHERE IN THE SAME
 * COMMIT. Last time /workbook and /notes were dropped from the bar and became
 * unreachable — seven lessons, one written by the family, behind a URL nobody
 * had. `also` below is the other half of that promise: every retired route
 * still lights a tab, so no screen reads as outside the app.
 */
const TABS = [
  {
    href: "/",
    label: "Hoje",
    en: "Today",
    Icon: IconHome,
    // The course, the drills and everything Praticar used to hold.
    also: [
      "/unidades",
      "/practice",
      "/missoes",
      "/workbook",
      "/stories",
      "/escutar",
      "/notes",
      "/homework",
    ],
  },
  {
    href: "/palavras",
    label: "Palavras",
    en: "Words",
    Icon: IconBook,
    also: ["/reference", "/verbos"],
  },
  { href: "/tutor", label: "Sandra", en: "Tutor", Icon: IconChat, also: [] },
  {
    href: "/progresso",
    label: "Progresso",
    en: "Progress",
    Icon: IconChart,
    also: ["/jogos"],
  },
  { href: "/familia", label: "Família", en: "Family", Icon: IconPeople, also: [] },
];

function isActive(pathname: string, tab: (typeof TABS)[number]) {
  // /practice/rever belongs to Palavras (it is the SRS queue), while the rest
  // of /practice belongs to Hoje — so the more specific prefix wins.
  if (pathname.startsWith("/practice/rever")) return tab.href === "/palavras";
  if (tab.href === "/") {
    return pathname === "/" || tab.also.some((p) => pathname.startsWith(p));
  }
  return (
    pathname.startsWith(tab.href) || tab.also.some((p) => pathname.startsWith(p))
  );
}

/**
 * Screens that own the whole viewport and supply their own chrome: the lesson
 * drill (its top bar has the ✕ and the progress track) and the placement flow.
 * A tab bar under a drill invites you to leave halfway through.
 */
function isImmersive(pathname: string) {
  return /^\/practice\/\d+/.test(pathname) || pathname.startsWith("/bem-vindo");
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
  const bilingual = useBilingual();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (isImmersive(pathname)) return null;

  return (
    <>
      {/* Desktop only. On a phone the azulejo band IS the top of the screen —
          two stacked headers was the "generic" look the redesign is fixing.
          Everything this bar holds (spend, painel, sair) is on Perfil, which
          the band's avatar links to. */}
      <header className="sticky top-0 z-40 hidden border-b border-sand bg-paper/90 backdrop-blur sm:block">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link href="/" className="flex shrink-0 items-baseline gap-1.5">
            <span className="font-display text-xl font-semibold tracking-tight">
              Português
            </span>
            <span className="hidden text-xs text-ink-faint sm:inline">
              · com a Sandra
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
            href="/perfil"
            title="O teu perfil"
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

        {/* Desktop / tablet: pill row. On phones the bottom bar takes over —
            a sticky bottom bar in a desktop window is a phone artefact. */}
        <nav className="mx-auto hidden max-w-5xl px-2 pb-2 sm:block">
          <ul className="flex flex-wrap gap-1">
            {TABS.map((t) => {
              const active = isActive(pathname, t);
              return (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-olive text-paper"
                        : "text-ink-soft hover:bg-sage-pale hover:text-ink"
                    )}
                  >
                    <t.Icon size={17} />
                    {t.label}
                    {bilingual ? (
                      <span className="font-normal opacity-60">· {t.en}</span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      {/* Phones: fixed bottom tab bar — every section one tap away, and it
          clears the iPhone home indicator via safe-area padding. */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-sand bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
        <ul className="flex items-stretch justify-between px-1">
          {TABS.map((t) => {
            const active = isActive(pathname, t);
            return (
              <li key={t.href} className="flex-1">
                <Link
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-px py-1.5 transition-colors",
                    active ? "text-olive" : "text-ink-faint"
                  )}
                >
                  <t.Icon size={21} />
                  <span
                    className={cn(
                      "text-2xs leading-tight",
                      active && "font-semibold"
                    )}
                  >
                    {t.label}
                  </span>
                  {/* Under the label, not beside it: five tabs on a 390px
                      phone have no horizontal room to spare. text-2xs is the
                      scale's floor — 9.5px sat below the minimum globals.css
                      itself declares. */}
                  {bilingual ? (
                    <span className="text-2xs leading-none opacity-60">
                      {t.en}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
