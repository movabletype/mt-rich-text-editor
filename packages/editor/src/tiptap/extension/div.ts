import { Node, mergeAttributes } from "@tiptap/core";

export interface DivOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    div: {
      setDiv: () => ReturnType;
      unsetDiv: () => ReturnType;
      setMain: () => ReturnType;
      unsetMain: () => ReturnType;
      setArticle: () => ReturnType;
      unsetArticle: () => ReturnType;
    };
  }
}

export const Div = Node.create<DivOptions>({
  name: "div",

  priority: 1000,

  group: "block",

  content: "block+",

  defining: true,

  parseHTML() {
    return [
      { tag: "div" },
      { tag: "main" },
      { tag: "article" },
      { tag: "section" },
      { tag: "aside" },
      { tag: "nav" },
      { tag: "header" },
      { tag: "footer" },
      { tag: "figure" },
      { tag: "details" },
      { tag: "dialog" },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const tag = node.attrs["data-tag"] || "div";
    return [
      tag,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
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
