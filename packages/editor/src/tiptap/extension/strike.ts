import { mergeAttributes } from "@tiptap/core";
import { Strike as TiptapStrike } from "@tiptap/extension-strike";

export const Strike = TiptapStrike.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      // Keep the source tag so that <del> and <strike> are not rewritten to <s>.
      tag: {
        default: "s",
        parseHTML: (element) => element.tagName.toLowerCase(),
        renderHTML: () => ({}),
      },
    };
  },

  renderHTML({ mark, HTMLAttributes }) {
    return [mark.attrs.tag, mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
});
