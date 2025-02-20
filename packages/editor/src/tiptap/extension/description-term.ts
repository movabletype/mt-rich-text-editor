import { Node } from "@tiptap/core";

export const DescriptionTerm = Node.create({
  name: "descriptionTerm",
  priority: 1000,
  group: "block",
  content: "(textBlock|paragraph) block*",
  defining: true,

  parseHTML() {
    return [{ tag: "dt" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["dt", HTMLAttributes, 0];
  },
});
