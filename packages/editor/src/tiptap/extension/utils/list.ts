import type { InputRule } from "@tiptap/core";

export const fixListItemContent: InputRule["handler"] = (props) => {
  const { state } = props;
  const { selection } = state.tr;
  const { $from } = selection;
  if ($from.node(-1).type.name === "listItem") {
    // parent node is listItem
    if ($from.node().type.name === "paragraph") {
      // current node is paragraph
      const textBlockType = state.schema.nodes.textBlock;
      state.tr.setNodeMarkup($from.before(), textBlockType);
    }
  }
};
