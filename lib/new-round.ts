/**
 * The URL for a brand-new practice round on the screen you are already on.
 *
 * The round seed lives in `?s=` and the server derives a stable one when it is
 * missing, so reloading resumes rather than reshuffles. That makes "another
 * round" an explicit request instead of a side effect of re-rendering.
 *
 * Call from an event handler only — it reads window.location and rolls a
 * random value, neither of which belongs in a render.
 */
export function nextRoundHref(): string {
  const url = new URL(window.location.href);
  url.searchParams.set("s", Math.random().toString(36).slice(2, 10));
  return `${url.pathname}${url.search}`;
}
