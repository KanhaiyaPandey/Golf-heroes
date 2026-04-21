import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  {
    ignores: [
      ".next/**",
      ".turbo/**",
      "dist/**",
      "node_modules/**",
      "next-env.d.ts",
      "out/**",
    ],
  },
  ...compat.extends(
    require.resolve("@golf-heroes/config-eslint"),
    "next/typescript",
  ),
];

export default config;
