// @ts-check
import vitest from "@vitest/eslint-plugin";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["src/**/__test__/**/*.test.ts*"],
    plugins: {
      // @ts-ignore
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      "max-lines-per-function": "off",
    },
  },
]);
