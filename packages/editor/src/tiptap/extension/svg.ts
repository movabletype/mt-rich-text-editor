import { Node, mergeAttributes } from "@tiptap/core";
import DOMPurify from "dompurify";

export const SVG = Node.create({
  name: "svg",
  group: "inline",
  inline: true,

  addAttributes() {
    return {
      content: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "svg",
        getAttrs: (element) => {
          if (!(element instanceof SVGElement)) {
            return false;
          }
          return {
            content: element.innerHTML,
          };
        },
      },
    ];
  },

  renderHTML({ node: { attrs } }) {
    const { content, ...attributes } = attrs;
    return [
      "svg",
      mergeAttributes(attributes.MTRichTextEditorHTMLAttributes || {}, {
        "data-mt-rich-text-editor-content": content,
      }),
      "",
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      for (const k in node.attrs.MTRichTextEditorHTMLAttributes) {
        dom.setAttribute(k, node.attrs.MTRichTextEditorHTMLAttributes[k]);
      }
      const content = node.attrs.content;
      const sanitizedContent = DOMPurify.sanitize(`<svg>${content}</svg>`);
      dom.innerHTML = sanitizedContent.substring(5, sanitizedContent.length - 6);

      return {
        dom,
      };
    };
  },
});
