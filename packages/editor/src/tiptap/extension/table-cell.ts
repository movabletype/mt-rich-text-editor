import { mergeAttributes } from "@tiptap/core";
import { TableCell as TiptapTableCell } from "@tiptap/extension-table-cell";

export const TableCell = TiptapTableCell.extend({
  content: "inline*",

  renderHTML({ HTMLAttributes }) {
    const { colspan, rowspan, ...rest } = HTMLAttributes;
    return [
      "td",
      mergeAttributes(rest, {
        colspan: colspan === 1 ? undefined : colspan,
        rowspan: rowspan === 1 ? undefined : rowspan,
      }),
      0,
    ];
  },
});
