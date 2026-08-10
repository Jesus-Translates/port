/**
 * Stage the COMPILED stylesheet and its fonts for the converter.
 *
 * app/globals.css is Tailwind v4 SOURCE — it opens with `@import "tailwindcss"`
 * and an unprocessed `@theme` block. Shipping that gives a design agent no
 * .card, no .btn-primary, no utilities at all: everything this app's look is
 * made of lives in the compiled output, not the source.
 *
 * Layout matters as much as the copy. Next emits `url(../media/<hash>.woff2)`
 * from `.next/static/chunks/`, so the CSS is staged under `css/` with the font
 * files beside it in `media/` — that keeps every url() resolving. Flattening
 * the CSS to a single file instead silently breaks all of them, and the app's
 * Fraunces/Inter become whatever fallback the renderer picks.
 */
import { readdirSync, statSync, copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const HERE = ".design-sync";
const CSS_OUT = join(HERE, "css");
const MEDIA_OUT = join(HERE, "media");

function walk(dir, ext) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, ext));
    else if (e.name.endsWith(ext)) out.push(p);
  }
  return out;
}

const sheets = walk(".next/static", ".css").map((p) => ({ p, size: statSync(p).size }));
if (sheets.length === 0) {
  console.error("✗ no compiled CSS under .next/static — run `npm run build` first");
  process.exit(1);
}
sheets.sort((a, b) => b.size - a.size);
const winner = sheets[0];

// A stylesheet that lost its component layer would sync silently and look fine
// until every design rendered unstyled.
const text = readFileSync(winner.p, "utf8");
for (const needed of [".card{", ".btn-primary", ".chip{", "--color-olive"]) {
  if (!text.includes(needed)) {
    console.error(`✗ ${winner.p} is missing ${needed} — wrong stylesheet picked`);
    process.exit(1);
  }
}

mkdirSync(CSS_OUT, { recursive: true });
mkdirSync(MEDIA_OUT, { recursive: true });
copyFileSync(winner.p, join(CSS_OUT, "app.css"));

// Copy only the fonts this stylesheet actually references.
const wanted = new Set(
  [...text.matchAll(/url\(\.\.\/media\/([^)]+)\)/g)].map((m) => m[1])
);
let copied = 0;
for (const name of wanted) {
  const src = join(".next/static/media", name);
  try {
    copyFileSync(src, join(MEDIA_OUT, name));
    copied++;
  } catch {
    console.error(`✗ font referenced but missing from .next/static/media: ${name}`);
    process.exit(1);
  }
}

console.log(
  `✓ ${winner.p} (${(winner.size / 1024).toFixed(0)} KB) → ${CSS_OUT}/app.css` +
    `, ${copied}/${wanted.size} referenced font(s) → ${MEDIA_OUT}/`
);
