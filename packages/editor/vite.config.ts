import { defineConfig } from "vite";
import type { ViteUserConfig } from "vitest/config";
import dts from "vite-plugin-dts";
import postcssNesting from "postcss-nesting";
import postcssInlineSvg from "postcss-inline-svg";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig(({ mode }) => {
  const config: ViteUserConfig = {
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
  };

  if (mode === "test") {
    // XXX: svelte requires "module" condition, but vitest drops it, so we need to add it back
    config.resolve = {
      conditions: [
        "module",
        "browser",
        process.env.NODE_ENV === "production" ? "production" : "development",
      ],
    };
  }

  return config;
});
