import { mount, unmount } from "svelte";
import type { Editor as TiptapEditor } from "@tiptap/core";
import { selectedRect } from "@tiptap/pm/tables";
import { cssColorToHex, cssSize } from "../../../util/html";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { CellData } from "./CellPropertiesPanel.svelte";
import CellPropertiesPanel from "./CellPropertiesPanel.svelte";
import type { TableToolbarOptions } from "./table-properties";

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
    borderColor: cssColorToHex(el.style.borderColor) ?? el.style.borderColor,
    backgroundColor: cssColorToHex(el.style.backgroundColor) ?? el.style.backgroundColor,
  };
};

let cellPropertiesModal: ReturnType<typeof mount> | undefined;
export const handleCellProperties = (tiptap: TiptapEditor, options?: TableToolbarOptions) => {
  cellPropertiesModal = mount(CellPropertiesPanel, {
    target: document.body,
    props: {
      cellData: getCurrentCellData(tiptap),
      borderPresetColors: options?.borderPresetColors,
      backgroundPresetColors: options?.backgroundPresetColors,
      onSubmit: (cellData: CellData) => {
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
            const rect = selectedRect(tiptap.state);
            if (rect) {
              const seen = new Set<number>();
              for (let row = rect.top; row < rect.bottom; row++) {
                for (let col = rect.left; col < rect.right; col++) {
                  const cellStart = rect.map.map[row * rect.map.width + col];
                  if (seen.has(cellStart)) {
                    continue;
                  }
                  seen.add(cellStart);

                  const pos = rect.tableStart + cellStart;
                  const node = tr.doc.nodeAt(pos);
                  if (node) {
                    const el = document.createElement("div");
                    el.style.cssText = node.attrs.style || "";

                    el.style.width = cssSize(cellData.width);
                    el.style.height = cssSize(cellData.height);
                    el.style.textAlign = cellData.horizontalAlign;
                    el.style.verticalAlign = cellData.verticalAlign;
                    el.style.borderColor = cellData.borderColor;
                    el.style.backgroundColor = cellData.backgroundColor;

                    tr.setNodeMarkup(pos, null, {
                      ...node.attrs,
                      scope: cellData.scope || undefined,
                      style: el.style.cssText,
                    });
                  }
                }
              }
            }
            return true;
          })
          .run();
        unmount(cellPropertiesModal as ReturnType<typeof mount>);
      },
      onClose: () => {
        unmount(cellPropertiesModal as ReturnType<typeof mount>);
      },
    },
  });
};
