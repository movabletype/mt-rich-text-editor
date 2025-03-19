import { mergeAttributes } from "@tiptap/core";
import { TableHeader as TiptapTableHeader } from "@tiptap/extension-table-header";

export const TableHeader = TiptapTableHeader.extend({
  content: "inline*",

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
      "th",
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
