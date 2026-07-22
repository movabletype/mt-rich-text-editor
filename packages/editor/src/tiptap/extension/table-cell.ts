import { mergeAttributes } from "@tiptap/core";
import { TableCell as TiptapTableCell } from "@tiptap/extension-table-cell";

export const TableCell = TiptapTableCell.extend({
  content: "(textBlock|block) block*",

  addAttributes() {
    return {
      ...this.parent?.(),
      scope: {
        default: "",
      },
      style: {
        default: "",
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const { colspan, rowspan, scope, style, ...attrs } = HTMLAttributes;
    return [
      "td",
      mergeAttributes(attrs, {
        colspan: colspan === 1 ? undefined : colspan,
        rowspan: rowspan === 1 ? undefined : rowspan,
        scope: scope === "" ? undefined : scope,
        style: style === "" ? undefined : style,
      }),
      0,
    ];
  },
});
