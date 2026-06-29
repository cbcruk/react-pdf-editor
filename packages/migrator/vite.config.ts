import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/index.ts", "src/browser.ts", "src/cli.ts"],
    dts: true,
    format: ["esm"],
  },
});
