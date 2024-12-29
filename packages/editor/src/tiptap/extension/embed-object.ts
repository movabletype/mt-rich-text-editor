import { Node, mergeAttributes } from "@tiptap/core";

interface EmbedData {
  url: string;
  maxwidth?: number;
  maxheight?: number;
}

export interface EmbedObjectOptions {
  HTMLAttributes: Record<string, any>;
  resolver: (params: EmbedData) => Promise<{ html: string }>;
}

declare module "@tiptap/core" {
  interface Commands {
    embedObject: {
      getEmbedObject: (attributes: EmbedData) => { html: string } | undefined;
    };
  }
}

export const EmbedObject = Node.create<EmbedObjectOptions>({
  name: "embedObject",
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
      "data-block": {
        default: null,
        renderHTML: () => null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "mt-rich-text-editor-embed-object",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) {
            return false;
          }

          return {
            href: element.getAttribute("href"),
            "data-block": element.getAttribute("data-block"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["mt-rich-text-editor-embed-object", mergeAttributes(this.options.HTMLAttributes), 0];
  },

  addCommands() {
    return {
      getEmbedObject: (embedData: EmbedData) =>
        (() => {
          return this.options.resolver(embedData);
        }) as any,
    };
  },
});
