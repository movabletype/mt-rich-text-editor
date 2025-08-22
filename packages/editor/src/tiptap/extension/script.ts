import { Node } from "@tiptap/core";
import { createPreviewIframe, destroyPreviewIframe } from "../../util/preview";

export interface ScriptOptions {
  allowedOrigins?: string[];
}

const getOrigin = (src: string | undefined) => {
  if (!src) {
    return undefined;
  }
  const anchor = document.createElement("a");
  anchor.href = src;
  return anchor.origin;
};

export const Script = Node.create<ScriptOptions>({
  name: "script",

  group: "inline",
  content: "text*",
  inline: true,
  atom: true,

  addOptions() {
    return {
      allowedOrigins: ["https://gist.github.com", "https://pastebin.com"],
    };
  },

  parseHTML() {
    return [
      {
        tag: "mt-rich-text-editor-script",
        preserveWhitespace: "full",
      },
    ];
  },

  addNodeView() {
    const allowedOrigins = this.options.allowedOrigins || [];

    return ({ editor, node }) => {
      const dom = document.createElement("div");
      dom.classList.add("mt-rich-text-editor-script");

      const attributes = node.attrs.MTRichTextEditorHTMLAttributes || {};

      dom.dataset.mtRichTextEditorScriptTitle =
        `<script ` +
        Object.entries(attributes)
          .map(([key, value]) => `${key}="${value}"`)
          .join(" ") +
        `/>`;

      const src = attributes.src;
      const srcOrigin = getOrigin(src);

      if (srcOrigin && allowedOrigins.includes(srcOrigin)) {
        dom.classList.add("mt-rich-text-editor-script--preview");

        const script = document.createElement("script");
        script.src = src;
        const iframe = createPreviewIframe(editor, script.outerHTML);

        dom.appendChild(iframe);

        return {
          dom,
          destroy: () => {
            destroyPreviewIframe(iframe);
          },
        };
      }

      dom.innerText = node.content.content
        .map((content) => content.text)
        .join("")
        .replace(/^\n/, "")
        .replace(/\s+$/, "");

      return {
        dom,
      };
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ["mt-rich-text-editor-script", HTMLAttributes, 0];
  },
});
