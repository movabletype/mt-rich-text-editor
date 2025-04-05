import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import postcssNesting from "postcss-nesting";
import postcssInlineSvg from "postcss-inline-svg";
import { svelte } from "@sveltejs/vite-plugin-svelte";

const resolveConditions = [
  "module",
  "browser",
  process.env.NODE_ENV === "production" ? "production" : "development",
];

export default defineConfig(({ mode }) => ({
  build: {
    lib: {
      entry: ["src/index.ts", "src/component.ts", "src/mt-rich-text-editor.ts"],
      formats: ["es"],
    },
    sourcemap: true,
    minify: true,
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
    // currently returns the same value, but may return a different value in the future when test
    conditions: mode === "test" ? resolveConditions : resolveConditions,
  },
}));
