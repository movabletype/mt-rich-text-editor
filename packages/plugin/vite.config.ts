import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "./mt-static/plugins/MTRichTextEditor/src/index.ts",
      fileName: () => "index.js",
      name: "MTRichTextEditor",
      formats: ["iife"],
    },
    outDir: "./mt-static/plugins/MTRichTextEditor/dist",
    sourcemap: true,
    minify: true,
    target: "es2017",
  },
});
