import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Content is read only through src/lib/api.ts so the backend can replace
    // the sample data later. Types may be imported anywhere. The mock store
    // seeds from the sample data and demo-credentials is a deletable demo
    // file; both go away with the backend.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/api.ts", "src/lib/mock-store.ts", "src/lib/demo-credentials.ts", "src/data/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/data/*", "!@/data/types", "**/data/*", "!**/data/types"],
              message: "Import content through @/lib/api, not from src/data.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "scripts/**", "docs/**"]),
]);

export default eslintConfig;
