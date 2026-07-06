import type { Editor } from "@tiptap/core";
import { Node } from "@tiptap/core";
import { Fragment } from "@tiptap/pm/model";
import { Selection, TextSelection } from "@tiptap/pm/state";

const graphemeSegmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

const getLastGraphemeLength = (text: string) => {
  if (text.length === 0) {
    return 0;
  }

  if (graphemeSegmenter) {
    let lastSegmentLength = 0;
    for (const { segment } of graphemeSegmenter.segment(text)) {
      lastSegmentLength = segment.length;
    }

    if (lastSegmentLength > 0) {
      return lastSegmentLength;
    }
  }

  const codePoints = Array.from(text);
  return codePoints.length > 0 ? codePoints[codePoints.length - 1].length : 0;
};

const findClosestAncestorDepth = (editor: Editor, nodeNames: string[]) => {
  const { $from } = editor.state.selection;

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if (nodeNames.includes($from.node(depth).type.name)) {
      return depth;
    }
  }

  return -1;
};

const isFirstChildPathFromAncestor = (editor: Editor, ancestorDepth: number) => {
  const { $from } = editor.state.selection;

  for (let depth = ancestorDepth + 1; depth <= $from.depth; depth += 1) {
    if ($from.index(depth - 1) !== 0) {
      return false;
    }
  }

  return true;
};

const cleanupTrailingBlankTextBlocksInListItem = (editor: Editor, textBlockName: string) => {
  const { state } = editor;
  const listItemDepth = findClosestAncestorDepth(editor, ["listItem"]);
  if (listItemDepth === -1) {
    return false;
  }

  const listItemNode = state.selection.$from.node(listItemDepth);
  if (listItemNode.childCount === 1) {
    // preserve the last blank text block
    return false;
  }

  const listItemPos = state.selection.$from.before(listItemDepth);

  let firstTrailingBlankIndex = -1;
  for (let index = listItemNode.childCount - 1; index >= 0; index -= 1) {
    const child = listItemNode.child(index);
    if (child.type.name !== textBlockName || child.textContent.trim() !== "") {
      break;
    }
    firstTrailingBlankIndex = index;
  }

  if (firstTrailingBlankIndex === -1) {
    return false;
  }

  let removeFrom = listItemPos + 1;
  for (let i = 0; i < firstTrailingBlankIndex; i += 1) {
    removeFrom += listItemNode.child(i).nodeSize;
  }

  let removeTo = removeFrom;
  for (let i = firstTrailingBlankIndex; i < listItemNode.childCount; i += 1) {
    const child = listItemNode.child(i);
    if (child.type.name !== textBlockName || child.textContent.trim() !== "") {
      break;
    }
    removeTo += child.nodeSize;
  }

  if (removeTo <= removeFrom) {
    return false;
  }

  editor.view.dispatch(state.tr.delete(removeFrom, removeTo));
  return true;
};

const collapseAdjacentTextBlocksInParent = (editor: Editor, textBlockName: string) => {
  const { state } = editor;
  const { selection } = state;
  const { $from } = selection;

  if ($from.depth < 1 || $from.parent.type.name !== textBlockName) {
    return false;
  }

  const parentDepth = $from.depth - 1;
  if (parentDepth === 0) {
    return false;
  }

  const parentNode = $from.node(parentDepth);
  if (parentNode.type.name === "listItem") {
    return false;
  }

  const currentIndex = $from.index(parentDepth);
  const textBlockIndex =
    currentIndex < parentNode.childCount &&
    parentNode.child(currentIndex).type.name === textBlockName
      ? currentIndex
      : currentIndex - 1;

  if (
    textBlockIndex < 0 ||
    textBlockIndex >= parentNode.childCount ||
    parentNode.child(textBlockIndex).type.name !== textBlockName
  ) {
    return false;
  }

  let runStartIndex = textBlockIndex;
  while (runStartIndex > 0 && parentNode.child(runStartIndex - 1).type.name === textBlockName) {
    runStartIndex -= 1;
  }

  let runEndIndex = textBlockIndex;
  while (
    runEndIndex + 1 < parentNode.childCount &&
    parentNode.child(runEndIndex + 1).type.name === textBlockName
  ) {
    runEndIndex += 1;
  }

  if (runStartIndex === runEndIndex) {
    return false;
  }

  const parentPos = $from.before(parentDepth);
  let replaceFrom = parentPos + 1;
  for (let i = 0; i < runStartIndex; i += 1) {
    replaceFrom += parentNode.child(i).nodeSize;
  }

  let replaceTo = replaceFrom;
  let mergedContent = Fragment.empty;
  let mergedSelectionOffset = 0;

  for (let i = runStartIndex; i <= runEndIndex; i += 1) {
    const child = parentNode.child(i);
    mergedContent = mergedContent.append(child.content);
    replaceTo += child.nodeSize;

    if (i < textBlockIndex) {
      mergedSelectionOffset += child.content.size;
    }
  }

  mergedSelectionOffset += $from.parentOffset;

  const textBlockType = state.schema.nodes[textBlockName];
  const mergedNode =
    mergedContent.size > 0 ? textBlockType.create(null, mergedContent) : textBlockType.create();
  const tr = state.tr.replaceWith(replaceFrom, replaceTo, mergedNode);

  const newSelectionPos = Math.min(
    replaceFrom + 1 + mergedSelectionOffset,
    replaceFrom + mergedNode.content.size + 1
  );
  tr.setSelection(TextSelection.create(tr.doc, newSelectionPos));

  editor.view.dispatch(tr);
  return true;
};

const deleteBackwardInTextBlock = (editor: Editor, textBlockName: string) => {
  const { state } = editor;
  const { selection } = state;
  const { $from, empty } = selection;

  if ($from.parent.type.name !== textBlockName || !empty || $from.parentOffset === 0) {
    return false;
  }

  const nodeBefore = $from.nodeBefore;
  if (!nodeBefore) {
    return false;
  }

  const deleteDistance =
    nodeBefore.isText && nodeBefore.text
      ? getLastGraphemeLength(nodeBefore.text)
      : nodeBefore.nodeSize;

  if (deleteDistance <= 0) {
    return false;
  }

  editor.view.dispatch(
    state.tr.delete(selection.from - deleteDistance, selection.from).scrollIntoView()
  );
  return true;
};

const preventEmptyTableCellTextBlockBackspace = (editor: Editor, textBlockName: string) => {
  const { selection } = editor.state;
  const { $from, empty } = selection;

  if (
    !empty ||
    $from.parent.type.name !== textBlockName ||
    $from.parentOffset !== 0 ||
    $from.parent.content.size !== 0
  ) {
    return false;
  }

  const tableCellDepth = findClosestAncestorDepth(editor, ["tableCell", "tableHeader"]);
  if (tableCellDepth === -1) {
    return false;
  }

  return isFirstChildPathFromAncestor(editor, tableCellDepth);
};

const handleTopLevelWrapperBackspace = (editor: Editor, textBlockName: string) => {
  const { state } = editor;
  const { selection } = state;
  const { $from, empty } = selection;

  if (!empty || $from.parent.type.name !== textBlockName || $from.parentOffset !== 0) {
    return false;
  }

  const parentDepth = $from.depth - 1;
  if (parentDepth !== 1) {
    return false;
  }

  const parentNode = $from.node(parentDepth);
  const currentTextBlockIndex = $from.index(parentDepth);
  const currentWrapperIndex = $from.index(0);

  if (
    parentNode.type.name === "listItem" ||
    currentTextBlockIndex !== 0 ||
    currentWrapperIndex !== 0
  ) {
    return false;
  }

  // If the wrapper has a single empty textBlock, delete or replace the wrapper
  if (parentNode.childCount === 1 && $from.parent.content.size === 0) {
    const wrapperFrom = $from.before(parentDepth);
    const wrapperTo = $from.after(parentDepth);
    let tr = state.tr;

    if (state.doc.childCount === 1) {
      const paragraphNode = state.schema.nodes.paragraph.create();
      tr = tr.replaceWith(wrapperFrom, wrapperTo, paragraphNode);
      tr.setSelection(TextSelection.create(tr.doc, wrapperFrom + 1));
    } else {
      tr = tr.delete(wrapperFrom, wrapperTo);
      tr.setSelection(
        Selection.near(tr.doc.resolve(Math.min(wrapperFrom, tr.doc.content.size)), 1)
      );
    }

    editor.view.dispatch(tr.scrollIntoView());
  }

  // Otherwise, prevent the default backspace from unwrapping the top-level wrapper
  return true;
};

const normalizeTextBlocksAfterBackspace = (editor: Editor, textBlockName: string) => {
  const parentNode = editor.state.selection.$from.node(-1);
  if (parentNode.type.name === "listItem") {
    cleanupTrailingBlankTextBlocksInListItem(editor, textBlockName);
    return;
  }

  collapseAdjacentTextBlocksInParent(editor, textBlockName);
};

export const TextBlock = Node.create({
  name: "textBlock",
  group: "block",
  content: "inline*",

  parseHTML() {
    return [
      {
        tag: "mt-text-block",
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) {
            return false;
          }
          return {};
        },
      },
    ];
  },

  renderHTML() {
    return ["mt-text-block", 0];
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        if (!editor.isActive(this.name)) {
          return false;
        }

        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        const parentNode = $from.node(-1);
        if (!parentNode) {
          return false;
        }

        if (parentNode.type.name === "tableCell" || parentNode.type.name === "tableHeader") {
          editor.chain().insertContent("<br />").run();
          return true;
        }

        const pos = $from.after(-1);
        const currentNodeContent = $from.parent.content.cut($from.parentOffset).toJSON();

        if (parentNode.type.name === "listItem" && !currentNodeContent) {
          // Delegate to Tiptap default behavior
          // And if the listing is de-listed, convert to paragraph
          setTimeout(() => {
            const $from = editor.state.selection.$from;
            const parentNode = $from.node(-1);
            if (parentNode.type.name !== "listItem") {
              editor.commands.setParagraph();
            }
          });
          return false;
        }

        const tr = editor
          .chain()
          .insertContentAt(pos, {
            type: parentNode.type.name,
            content: [
              {
                type: this.name,
                content: currentNodeContent,
              },
            ],
          })
          .deleteRange({ from: $from.pos, to: $from.after() });

        const result = tr.run();
        if (!result) return false;

        const resolvedPos = editor.state.doc.resolve(pos + 1);
        const textBlockPos = resolvedPos.start();

        editor.chain().setTextSelection(textBlockPos).focus().run();

        return true;
      },
      Backspace: ({ editor }) => {
        if (editor.isActive(this.name)) {
          if (preventEmptyTableCellTextBlockBackspace(editor, this.name)) {
            return true;
          }

          if (handleTopLevelWrapperBackspace(editor, this.name)) {
            return true;
          }

          if (deleteBackwardInTextBlock(editor, this.name)) {
            setTimeout(() => {
              normalizeTextBlocksAfterBackspace(editor, this.name);
            });
            return true;
          }

          setTimeout(() => {
            normalizeTextBlocksAfterBackspace(editor, this.name);
          });
        }

        if (editor.isActive("paragraph")) {
          const $from = editor.state.selection.$from;
          const parentNode = $from.node(-1);
          if (parentNode.type.name !== "doc") {
            return false;
          }

          setTimeout(() => {
            const $from = editor.state.selection.$from;
            const parentNode = $from.node(-1);
            if (parentNode.type.name === "listItem") {
              editor.commands.setNode("textBlock");
            }
          });
        }

        return false;
      },
    };
  },

  addStorage() {
    return {
      originalText: "",
    };
  },
});
