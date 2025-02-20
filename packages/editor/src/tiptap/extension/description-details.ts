import { Node } from "@tiptap/core";

export const DescriptionDetails = Node.create({
  name: "descriptionDetails",
  priority: 1000,
  group: "block",
  content: "(textBlock|paragraph) block*",
  defining: true,

  parseHTML() {
    return [{ tag: "dd" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["dd", HTMLAttributes, 0];
  },
});
