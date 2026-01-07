import type { UserConfig } from "vite";
import "vitest/config";

export default () => ({
  test: {
    name: "unit",
    environment: "happy-dom",
    globals: true,
    setupFiles: "src/tests/setup-vitest.ts",
    include: ["src/**/__test__/**/*.test.ts*"],
    reporters: ["verbose", "vitest-sonar-reporter"],
    outputFile: {
      "vitest-sonar-reporter": "./coverage/vitest-sonar-report.xml",
    },
    coverage: {
      enabled: false, // TODO: Enable coverage thresholds when coverage is stable
      reporter: ["clover", "json", "lcov", "text", "text-summary", "html"],
      reportsDirectory: "./coverage",
      include: ["src/app/**"],
      exclude: [
        "src/**/*.{constants,model,dto,schema,config,route,contract}.ts*",
        "src/**/shadcn/*",
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  } satisfies UserConfig["test"],
});
