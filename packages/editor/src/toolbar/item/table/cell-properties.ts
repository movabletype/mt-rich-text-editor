import { mount, unmount } from "svelte";
import type { Editor as TiptapEditor } from "@tiptap/core";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { CellData } from "./CellPropertiesPanel.svelte";
import CellPropertiesPanel from "./CellPropertiesPanel.svelte";

const getCurrentCellData = (tiptap: TiptapEditor): CellData => {
  const { state } = tiptap;
  let depth = state.selection.$anchor.depth;
  let cellNode = null;

  // Find the cell node by traversing up the document
  while (depth > 0) {
    const currentNode = state.selection.$anchor.node(depth);
    if (currentNode.type.name === "tableCell" || currentNode.type.name === "tableHeader") {
      cellNode = currentNode;
      break;
    }
    depth--;
  }

  return {
    width: cellNode?.attrs.style?.match(/width: ([^;]+)/)?.[1] || "",
    height: cellNode?.attrs.style?.match(/height: ([^;]+)/)?.[1] || "",
    element: cellNode?.type.name === "tableCell" ? "td" : "th",
    scope: cellNode?.attrs.scope || "",
    horizontalAlign: cellNode?.attrs.style?.match(/text-align: ([^;]+)/)?.[1] || "",
    verticalAlign: cellNode?.attrs.style?.match(/vertical-align: ([^;]+)/)?.[1] || "",
  };
};

const getCellNodePos = (tiptap: TiptapEditor): number | null => {
  if (!tiptap) {
    return null;
  }

  const { state } = tiptap;
  let depth = state.selection.$anchor.depth;

  while (depth > 0) {
    const currentNode = state.selection.$anchor.node(depth);
    if (currentNode.type.name === "tableCell" || currentNode.type.name === "tableHeader") {
      return state.selection.$anchor.before(depth);
    }
    depth--;
  }
  return null;
};

let cellPropertiesModal: ReturnType<typeof mount> | undefined;
export const handleCellProperties = (tiptap: TiptapEditor) => {
  mount(CellPropertiesPanel, {
    target: document.body,
    props: {
      cellData: getCurrentCellData(tiptap),
      onSubmit: (cellData: CellData) => {
        const cellPos = getCellNodePos(tiptap);
        if (cellPos !== null) {
          const node = tiptap?.state.selection?.$anchor.node();
          if (
            (node?.type.name === "tableCell" && cellData.element === "th") ||
            (node?.type.name === "tableHeader" && cellData.element === "td")
          ) {
            tiptap?.chain().focus().toggleHeaderCell().run();
          }

          tiptap
            ?.chain()
            .focus()
            .command(({ tr }) => {
              const node = tr.doc.nodeAt(cellPos);
              if (node) {
                let style = "";
                if (cellData.width) {
                  style += `width: ${cellData.width};`;
                }
                if (cellData.height) {
                  style += `height: ${cellData.height};`;
                }
                if (cellData.horizontalAlign) {
                  style += `text-align: ${cellData.horizontalAlign};`;
                }
                if (cellData.verticalAlign) {
                  style += `vertical-align: ${cellData.verticalAlign};`;
                }
                tr.setNodeMarkup(cellPos, null, {
                  ...node.attrs,
                  scope: cellData.scope || undefined,
                  style,
                });
              }
              return true;
            })
            .run();
        }
        unmount(cellPropertiesModal as ReturnType<typeof mount>);
      },
      onClose: () => {
        unmount(cellPropertiesModal as ReturnType<typeof mount>);
      },
    },
  });
};
