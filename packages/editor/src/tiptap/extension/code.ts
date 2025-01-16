import { Node, mergeAttributes } from "@tiptap/core";

export const Code = Node.create({
  name: "code",
  priority: 1000,
  group: "block",
  content: "text*",
  defining: true,

  parseHTML() {
    return [{ tag: "code" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["code", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
});
