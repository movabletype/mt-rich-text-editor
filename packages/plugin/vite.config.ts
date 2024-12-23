import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  build: {
    lib: {
      entry: "./mt-static/plugins/MTRichTextEditor/src/index.ts",
      fileName: () => "index.js",
      name: "MTRichTextEditor",
      formats: ["iife"],
    },
    outDir: "./mt-static/plugins/MTRichTextEditor/dist/iife",
    sourcemap: true,
    minify: true,
    target: "es2017",
  },
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true,
      },
    }),
  ],
  test: {
    globals: true,
  },
});
