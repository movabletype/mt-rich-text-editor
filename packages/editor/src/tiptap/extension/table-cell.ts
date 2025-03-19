import { mergeAttributes } from "@tiptap/core";
import { TableCell as TiptapTableCell } from "@tiptap/extension-table-cell";

export const TableCell = TiptapTableCell.extend({
  content: "inline*",

  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: "",
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const { colspan, rowspan, style, ...attrs } = HTMLAttributes;
    return [
      "td",
      mergeAttributes(attrs, {
        colspan: colspan === 1 ? undefined : colspan,
        rowspan: rowspan === 1 ? undefined : rowspan,
        style: style === "" ? undefined : style,
      }),
      0,
    ];
  },
});
