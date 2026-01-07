import reactScan from "@react-scan/vite-plugin-react-scan";
import react from "@vitejs/plugin-react";
import { type UserConfig } from "vite";
import viteConfigBase from "./vite.config.base";

export default (configEnv: { mode: string }): UserConfig => {
  const baseConfig = viteConfigBase(configEnv);

  return {
    ...baseConfig,
    plugins: [
      ...(baseConfig.plugins ?? []),
      react(),
      configEnv.mode === "development"
        ? reactScan({
            enable: true,
            autoDisplayNames: true,
          })
        : undefined,
    ].filter(Boolean),
  };
};
