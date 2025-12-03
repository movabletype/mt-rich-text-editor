import { BulletList as TiptapBulletList } from "@tiptap/extension-bullet-list";
import { fixListItemContent } from "./utils/list";

export const BulletList = TiptapBulletList.extend({
  addInputRules() {
    return this.parent?.().map((rule) => ({
      ...rule,
      handler: (props) => {
        rule.handler(props);
        fixListItemContent(props);
      },
    }))
  },
});
