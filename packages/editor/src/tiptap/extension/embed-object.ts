import { Node, mergeAttributes } from "@tiptap/core";
import type { Editor } from "@tiptap/core";
import { createPreviewIframe, destroyPreviewIframe } from "../../util/preview";

interface EmbedData {
  url: string;
  maxwidth?: number;
  maxheight?: number;
}

export interface EmbedObjectOptions {
  HTMLAttributes: Record<string, unknown>;
  resolver: (params: EmbedData) => Promise<{ html: string }>;
}

declare module "@tiptap/core" {
  interface Commands {
    embedObject: {
      getEmbedObject: (attributes: EmbedData) => Promise<{ html: string; inline?: string }>;
      insertEmbedObject: (html: string) => void;
    };
  }
}

export const EmbedObject = Node.create<EmbedObjectOptions>({
  name: "embedObject",
  priority: 1000,
  group: "block",
  content: "block*",
  defining: true,

  addAttributes() {
    return {
      "data-mt-rich-text-editor-block": {
        default: null,
        renderHTML: () => null,
      },
      content: {
        default: null,
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
            "data-mt-rich-text-editor-block": element.getAttribute(
              "data-mt-rich-text-editor-block"
            ),
            content: element.getAttribute("data-mt-rich-text-editor-content") || element.innerHTML,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "mt-rich-text-editor-embed-object",
      mergeAttributes(this.options.HTMLAttributes, {
        "data-mt-rich-text-editor-content": HTMLAttributes.content,
      }),
      0,
    ];
  },

  addNodeView() {
    return ({ editor, node }) => {
      const dom = createPreviewIframe(editor, node.attrs.content);
      return {
        dom,
        update: () => {
          // // Update iframe content when node changes
          // const content = node.content.content[0]?.content?.toString() || ''

          // iframe.contentDocument?.open()
          // iframe.contentDocument?.write(content)
          // iframe.contentDocument?.close()

          return true;
        },
        destroy: () => {
          destroyPreviewIframe(dom);
        },
      };
    };
  },

  addCommands() {
    return {
      getEmbedObject: (embedData: EmbedData) =>
        (() => {
          return this.options.resolver(embedData);
        }) as unknown as Promise<{ html: string; inline?: string }>,
      insertEmbedObject:
        (html: string) =>
        ({ state, commands }: Editor) => {
          const pos = state.selection.$anchor.pos;

          // Insert the embed object
          commands.insertContent({
            type: this.name,
            attrs: {
              content: html,
            },
          });

          // Move cursor after the inserted node
          commands.setTextSelection(pos + 2);

          return true;
        },
    };
  },
});
