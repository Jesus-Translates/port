/**
 * The redesign's icon set — eight hand-drawn glyphs, no library.
 *
 * The app used emoji everywhere, which read as decoration rather than
 * navigation and rendered differently on every platform (🏠 is a different
 * colour and weight on iOS, Android and Windows). These are stroked
 * `currentColor` paths, so an active tab tints its icon by inheriting.
 *
 * Sized by prop because the design uses the same glyph at very different
 * scales — the check is 24px on a calçada stone and 40px on the completion
 * badge, at different stroke weights.
 */

type IconProps = {
  size?: number;
  strokeWidth?: number;
  className?: string;
};

function base(size: number) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  };
}

const stroke = (w: number) => ({
  stroke: "currentColor",
  strokeWidth: w,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

/** Hoje — a house. */
export function IconHome({ size = 21, strokeWidth = 1.9, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path {...stroke(strokeWidth)} d="M3.5 10.4 12 3.6l8.5 6.8" />
      <path {...stroke(strokeWidth)} d="M5.6 9v10.4h12.8V9" />
      <path {...stroke(strokeWidth)} d="M9.9 19.4v-5.2h4.2v5.2" />
    </svg>
  );
}

/** Palavras — an open book. */
export function IconBook({ size = 21, strokeWidth = 1.9, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path {...stroke(strokeWidth)} d="M12 6.6v13" />
      <path
        {...stroke(strokeWidth)}
        d="M12 6.6C10.6 5.3 8.7 4.6 6.4 4.6H3.4v12.6h3c2.3 0 4.2.7 5.6 2"
      />
      <path
        {...stroke(strokeWidth)}
        d="M12 6.6c1.4-1.3 3.3-2 5.6-2h3v12.6h-3c-2.3 0-4.2.7-5.6 2"
      />
    </svg>
  );
}

/** Sandra — a speech bubble. */
export function IconChat({ size = 21, strokeWidth = 1.9, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path
        {...stroke(strokeWidth)}
        d="M20.4 12.2c0 3.9-3.8 7-8.4 7-.9 0-1.8-.1-2.6-.35L4.2 20.4l1.3-3.7C4.2 15.5 3.6 13.9 3.6 12.2c0-3.9 3.8-7 8.4-7s8.4 3.1 8.4 7Z"
      />
    </svg>
  );
}

/** Progresso — a bar chart. */
export function IconChart({ size = 21, strokeWidth = 1.9, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path {...stroke(strokeWidth)} d="M4 20h16" />
      <path {...stroke(strokeWidth)} d="M7 20v-6.2" />
      <path {...stroke(strokeWidth)} d="M12 20V6.4" />
      <path {...stroke(strokeWidth)} d="M17 20v-9.4" />
    </svg>
  );
}

/** Família — two figures. */
export function IconPeople({ size = 21, strokeWidth = 1.9, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle {...stroke(strokeWidth)} cx="9" cy="8.2" r="3.1" />
      <path {...stroke(strokeWidth)} d="M3.4 19.4c0-3 2.5-5.2 5.6-5.2s5.6 2.2 5.6 5.2" />
      <path {...stroke(strokeWidth)} d="M16.2 5.4a3.1 3.1 0 0 1 0 5.9" />
      <path {...stroke(strokeWidth)} d="M17.4 14.5c1.9.6 3.2 2.4 3.2 4.6" />
    </svg>
  );
}

/** A completed calçada stone, and the completion badge. */
export function IconCheck({ size = 24, strokeWidth = 2.8, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path {...stroke(strokeWidth)} d="M5 12.6 9.8 17.4 19 6.9" />
    </svg>
  );
}

/** A locked calçada stone. */
export function IconLock({ size = 20, strokeWidth = 1.9, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect
        {...stroke(strokeWidth)}
        x="4.8"
        y="10.4"
        width="14.4"
        height="9.2"
        rx="2.4"
      />
      <path {...stroke(strokeWidth)} d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.6 0v2.6" />
    </svg>
  );
}

/**
 * The streak flame — the one filled icon.
 *
 * Stroked, it read as a leaf at 13px. Fill carries the shape at that size,
 * which is why this one takes a `fill` rather than a stroke width.
 */
export function IconFlame({ size = 13, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path
        fill="currentColor"
        d="M13.1 2.2c.3 2.6-.7 4.2-2 5.6-1.4 1.5-3 2.9-3 5.6a5.9 5.9 0 0 0 11.8 0c0-3.4-2.2-5-3.5-7.3-.3 1-.9 1.7-1.7 2.2.2-2.4-.5-4.5-1.6-6.1Z"
      />
      <path
        fill="currentColor"
        opacity=".55"
        d="M8.6 13.9c0-1.9 1-3 1.9-4 .1 1.6.9 2.4 1.9 3.2.8.7 1.3 1.4 1.3 2.5a3.1 3.1 0 0 1-6.2 0c0-.6.4-1.2 1.1-1.7Z"
      />
    </svg>
  );
}
