import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import postcssNesting from "postcss-nesting";
import postcssInlineSvg from "postcss-inline-svg";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig(({ mode }) => ({
  build: {
    lib: {
      entry: ["src/index.ts", "src/mt-rich-text-editor.ts"],
      formats: ["es"],
    },
    sourcemap: true,
    minify: true,
    target: "es2017",
  },
  plugins: [
    dts(),
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
  test: {
    environment: "jsdom",
    globals: true,
    watch: false,
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    conditions: mode === "test" ? ["browser"] : [],
  },
}));
