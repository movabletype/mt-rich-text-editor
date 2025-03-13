import { Bold as TiptapBold } from "@tiptap/extension-bold";

export const Bold = TiptapBold.extend({
  priority: 1000,
  content: "inline*",
});
