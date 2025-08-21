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
      content: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-mt-rich-text-editor-embed-object]",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) {
            return false;
          }

          return {
            content: element.innerHTML,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({
        "data-mt-rich-text-editor-embed-object": "",
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
