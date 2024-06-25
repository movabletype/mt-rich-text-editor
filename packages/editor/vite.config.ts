import { defineConfig } from "vite";

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
});
