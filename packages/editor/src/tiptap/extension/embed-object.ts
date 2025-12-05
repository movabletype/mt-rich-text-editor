import { Node, mergeAttributes } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/core";
import { createPreviewIframe, destroyPreviewIframe } from "../../util/preview";
import { getAnchorNodePos } from "../../util/tiptap";

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
    return ({ editor, node, getPos }) => {
      const dom = createPreviewIframe(editor, node.attrs.content);

      const setSelection = () => {
        if (!getPos) {
          return;
        }

        let pos: number | undefined;
        try {
          pos = getPos();
        } catch {
          return;
        }

        if (typeof pos !== "number") {
          return;
        }

        editor.chain().setNodeSelection(pos).focus().run();
      };

      const handleClick = (event: MouseEvent) => {
        event.preventDefault();
        setSelection();
      };

      dom.addEventListener("click", handleClick);

      return {
        dom,
        destroy: () => {
          dom.removeEventListener("click", handleClick);
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
        const { state, view } = editor;
        const { selection } = state;

        // Delete the embedObject when the cursor is at the start of the following paragraph (or any block).
        if (selection.empty && selection.$from.parentOffset === 0) {
          const before = selection.$from.before();
          const nodeBefore = state.doc.resolve(before).nodeBefore;

          if (nodeBefore?.type.name === this.name) {
            const embedObjectSelection = NodeSelection.create(
              state.doc,
              before - nodeBefore.nodeSize
            );
            let tr = state.tr.setSelection(embedObjectSelection);

            if (selection.$from.node().content.size === 0) {
              // if current node is empty, delete the paragraph and select the embedObject
              tr = tr.delete(selection.from - 1, selection.to);
            } else {
              // else, just delete the embedObject
              tr = tr.deleteSelection();
            }

            view.dispatch(tr);
            return true;
          }
        }
      },
    };
  },
});
