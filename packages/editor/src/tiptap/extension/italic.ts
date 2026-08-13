import { mergeAttributes } from "@tiptap/core";
import { Italic as TiptapItalic } from "@tiptap/extension-italic";

export const Italic = TiptapItalic.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      // Keep the source tag so that <i> is not rewritten to <em>.
      tag: {
        default: "em",
        parseHTML: (element) => element.tagName.toLowerCase(),
        renderHTML: () => ({}),
      },
    };
  },

  renderHTML({ mark, HTMLAttributes }) {
    return [mark.attrs.tag, mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
});
