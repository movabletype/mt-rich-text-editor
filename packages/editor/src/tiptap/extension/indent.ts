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

const INDENT_STEP_PX = 80;
const PX_VALUE_PATTERN = /^(\d+(?:\.\d+)?)px$/;

// Extract the raw padding-left declaration value from the style attribute string
// (not element.style.paddingLeft, which also reflects the padding shorthand).
const parsePaddingLeft = (element: HTMLElement): string | null => {
  const style = element.getAttribute("style");
  if (!style) {
    return null;
  }

  const match = /(?:^|;)\s*padding-left\s*:\s*([^;]+)/i.exec(style);
  return match ? match[1].trim() : null;
};

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
          indent: {
            default: null,
            renderHTML: ({ indent }) => (indent ? { style: `padding-left: ${indent}` } : {}),
            parseHTML: (element) => parsePaddingLeft(element),
          },
        },
      },
    ];
  },

  addCommands() {
    const setNodeIndentMarkup = (tr: Transaction, pos: number, delta: number): Transaction => {
      const node = tr?.doc?.nodeAt(pos);

      if (!node) {
        return tr;
      }

      const { indent, ...attrs } = node.attrs;

      let level: number;
      if (indent == null) {
        level = 0;
      } else {
        const match = PX_VALUE_PATTERN.exec(String(indent));
        if (!match) {
          // Non-pixel (or otherwise unrecognized) indent values are left untouched.
          return tr;
        }
        level = Number(match[1]);
      }

      const nextLevel = level + delta * INDENT_STEP_PX;
      const nextIndent = nextLevel > 0 ? `${nextLevel}px` : null;

      return tr.setNodeMarkup(pos, node.type, { ...attrs, indent: nextIndent }, node.marks);
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
              if (!this.editor.isActive("listItem") && this.editor.isActive("textBlock")) {
                this.editor.commands.setParagraph();
              }
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
