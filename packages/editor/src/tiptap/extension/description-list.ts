import { Node } from "@tiptap/core";

export const DescriptionList = Node.create({
  name: "descriptionList",
  priority: 1000,
  group: "block",
  content: "(descriptionTerm|descriptionDetails|div)+",
  defining: true,

  parseHTML() {
    return [{ tag: "dl" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["dl", HTMLAttributes, 0];
  },
});
