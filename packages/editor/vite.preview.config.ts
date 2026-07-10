import { svelte } from "@sveltejs/vite-plugin-svelte";
import postcssInlineSvg from "postcss-inline-svg";
import postcssNesting from "postcss-nesting";
import { defineConfig } from "vite";

// The normal build produces the editor library. This build turns the Vite dev
// entry point (index.html) into a static site that can live at any Pages path.
export default defineConfig({
  base: "./",
  build: {
    emptyOutDir: true,
    outDir: "preview-dist",
  },
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true,
      },
    }),
  ],
  css: {
    postcss: {
      plugins: [postcssNesting, postcssInlineSvg],
    },
  },
});
