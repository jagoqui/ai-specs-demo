import { defineConfig } from "vite";
import reactConfig from "./config/vite/vite.config.react";
import vitestConfig from "./config/vite/vitest.config";

export default defineConfig((configEnv) => {
  const react = reactConfig(configEnv);
  const vitest = vitestConfig();

  return {
    ...react,
    ...vitest,
  };
});
