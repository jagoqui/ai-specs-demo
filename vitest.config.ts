import { UserConfig } from "vite";
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

export default defineConfig(async (configEnv) => {
  const resolved =
    typeof viteConfig === "function" ? await viteConfig(configEnv) : viteConfig;
  return mergeConfig(resolved, {
    test: {
      name: "unit",
      environment: "happy-dom",
      globals: true,
      setupFiles: "src/tests/setup-vitest.ts",
      include: ["src/**/__test__/**/*.test.ts*"],
      reporters: ["verbose", "vitest-sonar-reporter"],
      outputFile: {
        "vitest-sonar-reporter": "coverage/vitest-sonar-report.xml",
      },
      coverage: {
        enabled: true,
        reporter: ["clover", "json", "lcov", "text", "text-summary", "html"],
        reportsDirectory: "./coverage",
        include: ["src/app/**"],
        exclude: [
          "src/**/*.{constants,model,dto,schema,config,route,contract}.ts*",
          "src/**/shadcn/*",
        ],
        // thresholds: { //TODO: Enable coverage thresholds when coverage is stable
        //   statements: 100,
        //   branches: 100,
        //   functions: 100,
        //   lines: 100,
        // },
      },
    } satisfies UserConfig["test"],
  });
});
