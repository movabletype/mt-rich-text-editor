import { Node, mergeAttributes } from "@tiptap/core";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { Editor } from "@tiptap/core";
import { createPreviewIframe, destroyPreviewIframe } from "../../util/preview";
import { getAnchorNodePos } from "../../util/tiptap";

interface EmbedData {
  url: string;
  maxwidth?: number;
  maxheight?: number;
}

const insertParagraphBefore = ({ editor }: { editor: Editor }) => {
  if (!editor.isActive("embedObject")) {
    return false;
  }

  const pos = getAnchorNodePos(editor, "embedObject") as number;
  if (pos === 0) {
    editor.commands.insertContentAt(0, {
      type: "paragraph",
    });
    return true;
  } else {
    return false;
  }
};

const insertParagraphAfter = ({ editor }: { editor: Editor }) => {
  if (!editor.isActive("embedObject")) {
    return false;
  }

  const pos = getAnchorNodePos(editor, "embedObject") as number;
  const node = editor.state.doc.nodeAt(pos) as ProseMirrorNode;
  const nextPos = pos + node.nodeSize;
  if (nextPos >= editor.$doc.content.size) {
    editor.commands.insertContentAt(editor.$doc.content.size, {
      type: "paragraph",
    });
    if (!editor.state.doc.nodeAt(editor.$doc.content.size - 2)) {
      // FIXME: the insertion fails. So retry
      editor.commands.insertContentAt(editor.$doc.content.size, {
        type: "paragraph",
      });
    }
    return true;
  } else {
    return false;
  }
};

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

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        if (!editor.isActive(this.name)) {
          return false;
        }

        const pos = getAnchorNodePos(editor, "embedObject") as number;
        editor.commands.insertContentAt(pos, {
          type: "paragraph",
        });

        return true;
      },
      Backspace: ({ editor }) => {
        if (!editor.isActive(this.name)) {
          return false;
        }

        const pos = getAnchorNodePos(editor, "embedObject") as number;
        if (pos > 0 && pos <= 2) {
          editor.commands.deleteRange({ from: 0, to: 1 }); // delete first empty paragraph
          return true;
        } else {
          editor.commands.setTextSelection(pos - 1); // move to previous node
          return false; // then proceed to the original delete operation
        }
      },
      ArrowUp: insertParagraphBefore,
      ArrowLeft: insertParagraphBefore,
      ArrowDown: insertParagraphAfter,
      ArrowRight: insertParagraphAfter,
    };
  },
});
