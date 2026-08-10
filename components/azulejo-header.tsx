import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The olive azulejo band that tops every screen.
 *
 * The redesign's first complaint was that the app read as "a stack of white
 * cards on cream with no branded surface". This band is the answer, and it is
 * why it appears on six screens rather than just the home page — a brand you
 * meet once is decoration; one you meet every time is an identity.
 *
 * On phones this is the top of the screen: the app's sticky header is hidden
 * below `sm`, so the band clears the status bar itself via safe-area padding.
 * On desktop the pill nav sits above it and the top padding drops.
 *
 * The band always spans the full width; only its contents are constrained, so
 * the olive reaches both edges of a 1680px window instead of floating in a
 * centred column.
 */
export function AzulejoHeader({
  eyebrow,
  title,
  subtitle,
  avatar,
  trailing,
  variant = "soft",
  children,
  className,
}: {
  /** Small uppercase line above the title. Contextual, not a page label. */
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Initial for the avatar button; links to Perfil. Omit to hide. */
  avatar?: string;
  /** Anything that belongs top-right instead of an avatar. */
  trailing?: React.ReactNode;
  /**
   * "full" adds the diagonal hatch — for tall bands (Home) where the extra
   * layer reads as tile. "soft" is dots only: on a short band the diagonal
   * reads as noise.
   */
  variant?: "full" | "soft";
  /** Stat tiles, a segmented control, a chart — whatever the screen carries. */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        variant === "full" ? "azulejo" : "azulejo-soft",
        // The app's <main> is a padded max-w-5xl column; the band has to
        // escape it or it floats in a gutter with cream on three sides.
        "-mx-4 -mt-6 rounded-b-[28px] text-paper",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto max-w-5xl px-5",
          // Phones: this is the top of the screen, so clear the status bar.
          // Desktop: the pill nav already did.
          "pt-[calc(env(safe-area-inset-top)+26px)] pb-6 sm:pt-7"
        )}
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            {eyebrow ? (
              <p className="text-2xs font-semibold tracking-[.06em] text-paper/60 uppercase">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="mt-1 font-display text-[27px] leading-tight font-semibold tracking-[-.015em] sm:text-3xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-1 text-[13px] text-paper/70">{subtitle}</p>
            ) : null}
          </div>

          {avatar ? (
            <Link
              href="/perfil"
              aria-label="O teu perfil"
              className="tap-44 grid size-11 shrink-0 place-items-center rounded-[14px] border-[1.5px] border-paper/30 bg-paper/15 font-display text-base font-semibold transition-colors hover:bg-paper/25"
            >
              {avatar}
            </Link>
          ) : (
            trailing
          )}
        </div>

        {children ? <div className="mt-4">{children}</div> : null}
      </div>
    </header>
  );
}

/**
 * A stat tile on the band — streak, daily goal, anything with a label and a
 * number. Translucent paper on olive rather than a solid card, so the azulejo
 * still reads through it.
 */
export function BandTile({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-1 items-center gap-3 rounded-2xl bg-paper/15 px-3.5 py-3",
        className
      )}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-[.09em] text-paper/70 uppercase">
          {label}
        </p>
        <div className="mt-0.5 flex items-baseline gap-1">{children}</div>
      </div>
    </div>
  );
}
