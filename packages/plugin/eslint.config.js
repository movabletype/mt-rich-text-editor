import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import svelte from "eslint-plugin-svelte";

export default [
  { files: ["mt-static/plugins/MTRichTextEditor/src/**/*.{js,mjs,cjs,ts}"] },
  {
    ignores: [
      "mt-static/plugins/MTRichTextEditor/dist/**",
      "mt-static/plugins/MTRichTextEditor/locales/**",
    ]
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelte.configs["flat/recommended"],
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parserOptions: {
        parser: ts.parser
      }
    }
  },
];
