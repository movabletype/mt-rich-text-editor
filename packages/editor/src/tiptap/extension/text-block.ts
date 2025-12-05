import { Node } from "@tiptap/core";

export const TextBlock = Node.create({
  name: "textBlock",
  group: "block",
  content: "inline*",

  parseHTML() {
    return [
      {
        tag: "mt-text-block",
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) {
            return false;
          }
          return {};
        },
      },
    ];
  },

  renderHTML() {
    return ["mt-text-block", 0];
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        if (!editor.isActive(this.name)) {
          return false;
        }

        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        const parentNode = $from.node(-1);
        if (!parentNode) {
          return false;
        }

        if (parentNode.type.name === "tableCell" || parentNode.type.name === "tableHeader") {
          editor.chain().insertContent("<br />").run();
          return true;
        }

        const pos = $from.after(-1);
        const currentNodeContent = $from.parent.content.cut($from.parentOffset).toJSON();

        if (parentNode.type.name === "listItem" && !currentNodeContent) {
          // Delegate to Tiptap default behavior
          // And if the listing is de-listed, convert to paragraph
          setTimeout(() => {
            const $from = editor.state.selection.$from;
            const parentNode = $from.node(-1);
            if (parentNode.type.name !== "listItem") {
              editor.commands.setParagraph();
            }
          });
          return false;
        }

        const tr = editor
          .chain()
          .insertContentAt(pos, {
            type: parentNode.type.name,
            content: [
              {
                type: this.name,
                content: currentNodeContent,
              },
            ],
          })
          .deleteRange({ from: $from.pos, to: $from.after() });

        const result = tr.run();
        if (!result) return false;

        const resolvedPos = editor.state.doc.resolve(pos + 1);
        const textBlockPos = resolvedPos.start();

        editor.chain().setTextSelection(textBlockPos).focus().run();

        return true;
      },
      Backspace: ({ editor }) => {
        if (editor.isActive(this.name)) {
          setTimeout(() => {
            const { state } = editor;
            const $from = state.selection.$from;
            const parentNode = $from.node(-1);
            if (parentNode.type.name !== "listItem") {
              return;
            }
            // should clean up trailing blank textBlocks in listItem

            let listItemDepth = -1;
            for (let depth = $from.depth; depth > 0; depth -= 1) {
              if ($from.node(depth).type.name === "listItem") {
                listItemDepth = depth;
                break;
              }
            }

            if (listItemDepth === -1) {
              // failed to find listItem node
              return;
            }

            const listItemNode = $from.node(listItemDepth);
            if (listItemNode.childCount === 1) {
              // preserve the last blank text block
              return;
            }

            const listItemPos = $from.before(listItemDepth);

            let firstTrailingBlankIndex = -1;
            for (let index = listItemNode.childCount - 1; index >= 0; index -= 1) {
              const child = listItemNode.child(index);
              if (child.type.name !== this.name || child.textContent.trim() !== "") {
                break;
              }
              firstTrailingBlankIndex = index;
            }

            if (firstTrailingBlankIndex === -1) {
              // no trailing blank textBlocks found
              return;
            }

            let removeFrom = listItemPos + 1;
            for (let i = 0; i < firstTrailingBlankIndex; i += 1) {
              removeFrom += listItemNode.child(i).nodeSize;
            }

            let removeTo = removeFrom;
            for (let i = firstTrailingBlankIndex; i < listItemNode.childCount; i += 1) {
              const child = listItemNode.child(i);
              if (child.type.name !== this.name || child.textContent.trim() !== "") {
                break;
              }
              removeTo += child.nodeSize;
            }

            if (removeTo > removeFrom) {
              editor.view.dispatch(state.tr.delete(removeFrom, removeTo));
            }
          });
        }

        if (editor.isActive("paragraph")) {
          const $from = editor.state.selection.$from;
          const parentNode = $from.node(-1);
          if (parentNode.type.name !== "doc") {
            return;
          }

          setTimeout(() => {
            const $from = editor.state.selection.$from;
            const parentNode = $from.node(-1);
            if (parentNode.type.name === "listItem") {
              editor.commands.setNode("textBlock");
            }
          });
        }
      },
    };
  },

  addStorage() {
    return {
      originalText: "",
    };
  },
});
