import { Node } from "@tiptap/core";

export const Summary = Node.create({
  name: "summary",
  priority: 1000,
  group: "block",
  content: "inline*",
  defining: true,

  parseHTML() {
    return [{ tag: "summary" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["summary", HTMLAttributes, 0];
  },
});
