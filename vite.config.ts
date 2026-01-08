import { defineConfig } from "vite";
import reactConfig from "./config/vite/vite.config.react";

export default defineConfig((configEnv) => {
  const react = reactConfig(configEnv);
  return {
    ...react,
  };
});
