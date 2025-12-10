import { ListItem as TiptapListItem } from "@tiptap/extension-list-item";
import { mergeAttributes } from "@tiptap/core";

export const ListItem = TiptapListItem.extend({
  name: "listItem",
  priority: 1000,
  content: "(textBlock|block) block*",

  parseHTML() {
    return [
      {
        tag: "li",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["li", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addKeyboardShortcuts() {
    const parentShortcuts = this.parent();
    return {
      ...parentShortcuts,
      "Shift-Tab": () => {
        parentShortcuts["Shift-Tab"]();
        if (!this.editor.isActive("listItem") && this.editor.isActive("textBlock")) {
          this.editor.commands.setParagraph();
        }
        return true;
      },
    };
  },
});
