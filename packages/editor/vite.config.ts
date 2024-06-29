import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: "src/editor.ts",
      fileName: "editor",
      formats: ["es"],
    },
    sourcemap: true,
    minify: true,
    target: "es2017",
  },
  plugins: [dts()],
});
