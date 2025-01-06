import { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { Table as TiptapTable } from "@tiptap/extension-table";

export const Table = TiptapTable.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: "width: 100%;",
      },
    };
  },

  addOptions() {
    const options = this.parent?.();
    if (options) {
      (options as any).View = class extends (options.View as any) {
        update(node: ProseMirrorNode) {
          super.update(node);
          this.table.style.cssText = node.attrs.style;
          return true;
        }
      };
    }
    return options;
  },
});
