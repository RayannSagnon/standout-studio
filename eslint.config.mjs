import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // The site's page transitions clone and move real <img> nodes (Work → case study,
    // the wall, the viewing room), so next/image wrappers would break them.
    files: ["src/site/**"],
    rules: { "@next/next/no-img-element": "off" },
  },
  {
    // Client area and admin area pages use plain links on purpose: every page is
    // rendered by the server for the signed-in person, and leaving for the public
    // site must be a full load so its single app starts from the right URL.
    files: ["src/app/admin/**", "src/app/client/**", "src/app/fr/client/**", "src/components/portal/**"],
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
