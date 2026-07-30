import { Bold as TiptapBold } from "@tiptap/extension-bold";

export const Bold = TiptapBold.extend({
  priority: 1000,
  // MarkConfig has no `content` field in its type, but Tiptap accepts it at runtime
  // to let this mark contain block-level content.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  content: "inline*",
});
