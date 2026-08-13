import { mergeAttributes } from "@tiptap/core";
import { Bold as TiptapBold } from "@tiptap/extension-bold";

export const Bold = TiptapBold.extend({
  priority: 1000,
  // MarkConfig has no `content` field in its type, but Tiptap accepts it at runtime
  // to let this mark contain block-level content.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  content: "inline*",

  addAttributes() {
    return {
      ...this.parent?.(),
      // Keep the source tag so that <b> is not rewritten to <strong>.
      tag: {
        default: "strong",
        parseHTML: (element) => element.tagName.toLowerCase(),
        renderHTML: () => ({}),
      },
    };
  },

  renderHTML({ mark, HTMLAttributes }) {
    return [mark.attrs.tag, mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
});
