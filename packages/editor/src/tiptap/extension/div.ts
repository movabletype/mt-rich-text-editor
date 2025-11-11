import { Node, mergeAttributes } from "@tiptap/core";

export interface DivOptions {
  elements: string[];
}

export const Div = Node.create<DivOptions>({
  name: "div",
  priority: 1000,
  group: "block",
  content: "block+",
  defining: true,

  addOptions() {
    return {
      elements: [],
    };
  },

  parseHTML() {
    return [
      { tag: "div:not([data-mt-rich-text-editor-embed-object])" },
      ...this.options.elements.map((tag) => ({ tag })),
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const tag = node.attrs["data-tag"] || "div";
    return [
      tag,
      mergeAttributes(HTMLAttributes, {
        "data-tag": undefined,
      }),
      0,
    ];
  },

  addAttributes() {
    return {
      "data-tag": {
        default: "div",
        parseHTML: (element) => element.tagName.toLowerCase(),
      },
    };
  },
});
