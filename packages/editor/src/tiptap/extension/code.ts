import { Node, mergeAttributes } from "@tiptap/core";

export const Code = Node.create({
  name: "code",
  priority: 1000,
  group: "inline",
  inline: true,
  content: "text*",
  defining: true,

  parseHTML() {
    return [{
      tag: "code",
      preserveWhitespace: 'full',
    }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["code", HTMLAttributes, 0];
  },
});
