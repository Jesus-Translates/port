/** Shared avatar/emoji lookup so every user gets a face, not just the first three. */
const AVATARS: Record<string, string> = {
  kelly: "👩‍🏫",
  jenni: "🌻",
  robert: "🏄",
  bobby: "⚽",
  sarah: "🌸",
  hannah: "🦋",
  rebecca: "🎨",
  sammy: "🐬",
};

const FALLBACKS = ["🌊", "⭐", "🍊", "🌿", "🎧", "🦜", "🌞", "🐚"];

export function avatarFor(name: string): string {
  const key = name.trim().toLowerCase();
  if (AVATARS[key]) return AVATARS[key];
  // Stable per-name fallback so a person keeps the same icon across sessions.
  let hash = 0;
  for (const ch of key) hash = (hash + ch.charCodeAt(0)) % FALLBACKS.length;
  return FALLBACKS[hash];
}

export function titleCase(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}
