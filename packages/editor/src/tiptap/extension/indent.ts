import { Command, Extension } from "@tiptap/core";
import { AllSelection, TextSelection, Transaction } from "prosemirror-state";

export interface IndentOptions {
  types: string[];
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType;
      outdent: () => ReturnType;
    };
  }
}

export const Indent = Extension.create<IndentOptions>({
  name: "indent",

  addOptions() {
    return {
      types: ["paragraph"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          "data-mt-indent": {
            default: null,
            renderHTML: ({ "data-mt-indent": indent }) =>
              indent && indent !== "0"
                ? {
                    style: `padding-left: ${indent * 80}px`,
                  }
                : {},
            parseHTML: (element) => Number(element.getAttribute("data-mt-indent") || null),
          },
        },
      },
    ];
  },

  addCommands() {
    const setNodeIndentMarkup = (tr: Transaction, pos: number, delta: number): Transaction => {
      const node = tr?.doc?.nodeAt(pos);

      if (node) {
        let { "data-mt-indent": indent, ...attrs } = node.attrs;
        indent = (indent || 0) + delta;
        if (indent > 0) {
          attrs = { ...attrs, "data-mt-indent": indent };
        }
        return tr.setNodeMarkup(pos, node.type, attrs, node.marks);
      }
      return tr;
    };

    const updateIndentLevel = (tr: Transaction, delta: number): Transaction => {
      const { doc, selection } = tr;

      if (
        doc &&
        selection &&
        (selection instanceof TextSelection || selection instanceof AllSelection)
      ) {
        const { from, to } = selection;
        doc.nodesBetween(from, to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            tr = setNodeIndentMarkup(tr, pos, delta);
            return false;
          } else if (node.type.name === "listItem") {
            if (delta > 0) {
              this.editor.commands.sinkListItem("listItem");
            } else if (delta < 0) {
              this.editor.commands.liftListItem("listItem");
            }
            return false;
          }

          return true;
        });
      }

      return tr;
    };
    const applyIndent: (direction: number) => () => Command =
      (direction) =>
      () =>
      ({ tr, state, dispatch }) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        tr = updateIndentLevel(tr, direction);

        if (tr.docChanged) {
          dispatch?.(tr);
          return true;
        }

        return false;
      };

    return {
      indent: applyIndent(1),
      outdent: applyIndent(-1),
    };
  },
});
