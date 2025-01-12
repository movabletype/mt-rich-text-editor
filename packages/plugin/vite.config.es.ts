import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  build: {
    lib: {
      entry: [
        "./mt-static/plugins/MTRichTextEditor/src/settings.ts",
      ],
      formats: ["es"],
    },
    outDir: "./mt-static/plugins/MTRichTextEditor/dist/es",
    sourcemap: true,
    minify: false,
    target: "es2017",
  },
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true,
      },
    }),
  ],
});
