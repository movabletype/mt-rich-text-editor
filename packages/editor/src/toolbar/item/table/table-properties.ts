import { mount, unmount } from "svelte";
import type { Editor as TiptapEditor } from "@tiptap/core";
// @ts-ignore
import type { TableData } from "./TablePropertiesPanel.svelte";
import TablePropertiesPanel from "./TablePropertiesPanel.svelte";

const getCurrentTableWidth = (tiptap: TiptapEditor): string => {
  if (!tiptap) {
    return "100%";
  }

  const { state } = tiptap;
  let depth = state.selection.$anchor.depth;
  let tableNode = null;

  // Find the table node by traversing up the document
  while (depth > 0) {
    const currentNode = state.selection.$anchor.node(depth);
    if (currentNode.type.name === "table") {
      tableNode = currentNode;
      break;
    }
    depth--;
  }

  return tableNode?.attrs.style?.match(/width: ([^;]+)/)?.[1] || "100%";
};

const getTableNodePos = (tiptap: TiptapEditor): number | null => {
  if (!tiptap) {
    return null;
  }

  const { state } = tiptap;
  let depth = state.selection.$anchor.depth;

  while (depth > 0) {
    const currentNode = state.selection.$anchor.node(depth);
    if (currentNode.type.name === "table") {
      return state.selection.$anchor.before(depth);
    }
    depth--;
  }
  return null;
};

let tablePropertiesModal: ReturnType<typeof mount> | undefined;
export const handleTableProperties = (tiptap: TiptapEditor) => {
  mount(TablePropertiesPanel, {
    target: document.body,
    props: {
      tableData: {
        width: getCurrentTableWidth(tiptap),
      },
      onSubmit: (tableData: TableData) => {
        const tablePos = getTableNodePos(tiptap);
        if (tablePos !== null) {
          tiptap
            ?.chain()
            .focus()
            .command(({ tr }) => {
              const node = tr.doc.nodeAt(tablePos);
              if (node) {
                tr.setNodeMarkup(tablePos, null, {
                  ...node.attrs,
                  style: `width: ${tableData.width}`,
                });
              }
              return true;
            })
            .run();
        }
        unmount(tablePropertiesModal as ReturnType<typeof mount>);
      },
      onClose: () => {
        unmount(tablePropertiesModal as ReturnType<typeof mount>);
      },
    },
  });
};
