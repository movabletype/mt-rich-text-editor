import { defineConfig } from "vite";
import type { ViteUserConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig(({ mode }) => {
  const config: ViteUserConfig = {
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
    },
    plugins: [
      svelte({
        compilerOptions: {
          customElement: true,
        },
      }),
    ],
    test: {
      environment: "jsdom",
      globals: true,
      watch: false,
      include: ["mt-static/plugins/MTRichTextEditor/src/**/*.test.ts"],
      setupFiles: ["./mt-static/plugins/MTRichTextEditor/src/test/setup/dom.ts"],
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
