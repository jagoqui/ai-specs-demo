import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import path from "path";
import { type UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default ({ mode }: { mode: string }): UserConfig => ({
  plugins: [devtools(), tailwindcss(), tsconfigPaths()],
  envDir:
    mode === "production"
      ? path.resolve(__dirname, "../../")
      : path.resolve(__dirname, "../../environments"),
});
