import { Node, mergeAttributes } from "@tiptap/core";

export interface BlockLinkOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    blockLink: {
      setBlockLink: (attributes?: {
        href?: string;
        "data-mt-rich-text-editor-block"?: string;
      }) => ReturnType;
      unsetBlockLink: () => ReturnType;
    };
  }
}

export const BlockLink = Node.create<BlockLinkOptions>({
  name: "blockLink",
  priority: 1000,
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      HTMLAttributes: {
        default: {},
        parseHTML: (element) => {
          const attrs: Record<string, string> = {};
          Array.from(element.attributes).forEach((attr) => {
            attrs[attr.name] = attr.value;
          });
          return attrs;
        },
        renderHTML: (attributes) => attributes.HTMLAttributes,
      },
      "data-mt-rich-text-editor-block": {
        default: null,
        renderHTML: () => null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "a[data-mt-rich-text-editor-block]",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) {
            return false;
          }

          return {
            href: element.getAttribute("href"),
            "data-mt-rich-text-editor-block": element.getAttribute(
              "data-mt-rich-text-editor-block"
            ),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { href } = HTMLAttributes;
    return ["a", mergeAttributes(this.options.HTMLAttributes, { href }), 0];
  },

  addCommands() {
    return {
      setBlockLink:
        (attributes = {}) =>
        ({ commands }) => {
          return commands.wrapIn(this.name, attributes);
        },
      unsetBlockLink:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },
});
