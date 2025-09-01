import type { Editor } from "@tiptap/core";

export const getAnchorNodePos = (editor: Editor, name: string): number | undefined => {
  const { state } = editor;

  for (let depth = state.selection.$anchor.depth; depth > 0; depth--) {
    const currentNode = state.selection.$anchor.node(depth);
    if (currentNode.type.name === name) {
      return state.selection.$anchor.before(depth);
    }
  }
};
