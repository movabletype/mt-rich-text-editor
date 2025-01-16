import { Node, mergeAttributes } from "@tiptap/core";

export const PreBlock = Node.create({
  name: "preBlock",
  priority: 1000,
  group: "block",
  content: "block*",
  defining: true,

  parseHTML() {
    return [
      { tag: 'pre[data-mt-rich-text-editor-block]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['pre', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },
}) 
