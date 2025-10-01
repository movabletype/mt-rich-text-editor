import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: process.env.VITE_PRESS_BASE_URL || "",
  lang: "ja",
  title: "MTRichTextEditor",
  titleTemplate: ":title | MTRichTextEditor 開発者向けガイド",
  description:
    "Movable Type Rich Text Editorをプラグインを使って拡張する方法を解説します。",
  cleanUrls: true,
  themeConfig: {
    sidebar: [
      {
        text: "開発者向けガイド",
        items: [
          {
            text: "エディタを拡張するプラグインの作成の基本",
            link: "/mt-plugin",
          },
          { text: "エディタの初期化オプション", link: "/editor-options" },
          { text: "ツールバーのカスタマイズ", link: "/toolbar-item-element" },
          {
            text: "ステータスバーのカスタマイズ",
            link: "/statusbar-item-element",
          },
          { text: "貼り付け形式の追加", link: "/paste-menu-item-element" },
          {
            text: "クイックアクションのカスタマイズ",
            link: "/quick-action-item-element",
          },
          { text: "TiptapのAPIの利用", link: "/tiptap-api" },
          {
            text: "ウェブページの埋め込み機能のカスタマイズ",
            link: "/embed-url",
          },
        ],
      },
    ],
  },
  markdown: {
    languageAlias: {
      mtml: "html",
    },
  },
});
