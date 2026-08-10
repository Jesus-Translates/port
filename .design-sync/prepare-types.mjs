/**
 * Emit the declaration tree the converter reads props from, then make it
 * self-contained.
 *
 * Two steps, both necessary:
 *
 * 1. `tsc -p tsconfig.types.json` writes types/ — without it every component
 *    ships `{ [key: string]: unknown }` and the design agent has no API to
 *    code against.
 *
 * 2. Rewrite `@/…` specifiers to relative paths. TypeScript preserves the
 *    alias verbatim in declaration output, but the converter parses the tree
 *    with its own ts-morph project that has no `paths` mapping — so
 *    `import { type Tense } from "@/lib/verbs"` silently fails to resolve and
 *    the prop lands in the shipped .d.ts as a dangling `Tense`. A type the
 *    agent cannot resolve is worse than no type: it looks authoritative.
 */
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const TYPES = resolve("types");

// Start clean so a renamed or deleted component can't leave a stale .d.ts the
// converter would still happily read props from.
rmSync(TYPES, { recursive: true, force: true });
execFileSync("npx", ["tsc", "-p", ".design-sync/tsconfig.types.json"], {
  stdio: "inherit",
});

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith(".d.ts")) out.push(p);
  }
  return out;
}

let rewritten = 0;
const files = walk(TYPES);
for (const file of files) {
  const before = readFileSync(file, "utf8");
  const after = before.replace(/"@\/([^"]+)"/g, (_m, sub) => {
    let rel = relative(dirname(file), join(TYPES, sub)).replace(/\\/g, "/");
    if (!rel.startsWith(".")) rel = `./${rel}`;
    return `"${rel}"`;
  });
  if (after !== before) {
    writeFileSync(file, after);
    rewritten++;
  }
}

// A leftover alias is the exact failure this script exists to prevent, so it
// is an error rather than a warning.
const leftover = files.filter((f) => /"@\//.test(readFileSync(f, "utf8")));
if (leftover.length > 0) {
  console.error(`✗ unresolved @/ aliases remain in:\n  ${leftover.join("\n  ")}`);
  process.exit(1);
}

console.log(
  `✓ types/: ${files.length} .d.ts emitted, ${rewritten} with @/ rewritten to relative`
);
