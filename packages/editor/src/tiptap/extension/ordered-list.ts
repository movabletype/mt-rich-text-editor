import { OrderedList as TiptapOrderedList } from "@tiptap/extension-ordered-list";
import { fixListItemContent } from "./utils/list";

export const OrderedList = TiptapOrderedList.extend({
  addInputRules() {
    return this.parent?.().map((rule) => ({
      ...rule,
      handler: (props) => {
        rule.handler(props);
        fixListItemContent(props);
      },
    }));
  },
});
