import { Mark } from "@tiptap/core";

export const Span = Mark.create({
  name: "span",
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
