import { Mark } from "@tiptap/core";

export const Span = Mark.create({
  name: "span",
  priority: 1000,
  content: "inline*",

  parseHTML() {
    return [
      {
        tag: "span",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },
});
