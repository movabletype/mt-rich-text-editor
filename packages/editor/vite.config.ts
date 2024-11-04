import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import postcssNesting from "postcss-nesting";
import postcssInlineSvg from "postcss-inline-svg";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      fileName: "editor",
      formats: ["es"],
    },
    sourcemap: true,
    minify: true,
    target: "es2017",
  },
  plugins: [dts()],
  css: {
    postcss: {
      plugins: [postcssNesting, postcssInlineSvg],
    },
  },
});
