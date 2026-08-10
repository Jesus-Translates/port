import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // .claude holds agent worktrees whose .next build artifacts are not ours to lint.
    ignores: [
      "node_modules/**",
      ".next/**",
      ".vercel/**",
      ".claude/**",
      "next-env.d.ts",
    ],
  },
]);
