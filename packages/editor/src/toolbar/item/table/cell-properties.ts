import { mount, unmount } from "svelte";
import type { Editor as TiptapEditor } from "@tiptap/core";
import { cssSize } from "../../../util/html";
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

  const el = document.createElement("div");
  el.style.cssText = cellNode?.attrs.style || "";
  return {
    width: el.style.width || "",
    height: el.style.height || "",
    element: cellNode?.type.name === "tableCell" ? "td" : "th",
    scope: cellNode?.attrs.scope || "",
    horizontalAlign: el.style.textAlign || "",
    verticalAlign: el.style.verticalAlign || "",
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
                const el = document.createElement("div");
                el.style.cssText = node.attrs.style || "";

                el.style.width = cssSize(cellData.width);
                el.style.height = cssSize(cellData.height);
                el.style.textAlign = cellData.horizontalAlign;
                el.style.verticalAlign = cellData.verticalAlign;

                tr.setNodeMarkup(cellPos, null, {
                  ...node.attrs,
                  scope: cellData.scope || undefined,
                  style: el.style.cssText,
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
