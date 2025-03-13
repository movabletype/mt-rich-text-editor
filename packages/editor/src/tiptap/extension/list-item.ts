import { ListItem as TiptapListItem } from "@tiptap/extension-list-item";
import { mergeAttributes } from "@tiptap/core";

export const ListItem = TiptapListItem.extend({
  name: "listItem",
  priority: 1000,
  content: "(textBlock|block)*",

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
});
