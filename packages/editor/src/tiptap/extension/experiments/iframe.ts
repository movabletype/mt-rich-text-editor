import { Node } from "@tiptap/core";

export default Node.create({
  name: "iframe",
  group: "inline",
  content: "text*",
  inline: true,
  atom: true,

  parseHTML() {
    return [
      {
        tag: "iframe",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["iframe", HTMLAttributes];
  },
});
