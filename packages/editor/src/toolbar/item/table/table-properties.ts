import { mount, unmount } from "svelte";
import type { Editor as TiptapEditor } from "@tiptap/core";
import { selectedRect } from "@tiptap/pm/tables";
import { cssSize } from "../../../util/html";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { TableData } from "./TablePropertiesPanel.svelte";
import TablePropertiesPanel from "./TablePropertiesPanel.svelte";

const getCurrentTableData = (tiptap: TiptapEditor): TableData => {
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

  const el = document.createElement("div");
  el.style.cssText = tableNode?.attrs.style || "";
  return {
    width: el.style.width || "100%",
    height: el.style.height || "",
    cellSpacing: el.style.borderSpacing || "",
    borderWidth: el.style.borderWidth || "",
  };
  // <table border="1" style="border-collapse: collapse; width: 100.097%; height: 200px; border-width: 1px; border-spacing: 1px; margin-left: 0px; margin-right: auto;">
};

const getTableNodePos = (tiptap: TiptapEditor): number | null => {
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
      tableData: getCurrentTableData(tiptap),
      onSubmit: (tableData: TableData) => {
        const tablePos = getTableNodePos(tiptap);
        if (tablePos !== null) {
          tiptap
            ?.chain()
            .focus()
            .command(({ tr }) => {
              const node = tr.doc.nodeAt(tablePos);
              if (node) {
                const el = document.createElement("div");
                el.style.cssText = node.attrs.style || "";

                el.style.width = cssSize(tableData.width);
                el.style.height = cssSize(tableData.height);
                el.style.borderSpacing = tableData.cellSpacing;
                el.style.borderWidth = cssSize(tableData.borderWidth);

                tr.setNodeMarkup(tablePos, null, {
                  ...node.attrs,
                  style: el.style.cssText,
                });

                const rect = selectedRect(tiptap.state);
                if (rect) {
                  rect.map.map.forEach((i) => {
                    const cell = rect.table.nodeAt(i);
                    if (cell) {
                      const el = document.createElement("div");
                      el.style.cssText = cell.attrs.style || "";
                      el.style.borderWidth = cssSize(tableData.borderWidth);

                      tr.setNodeMarkup(rect.tableStart + i, null, {
                        ...cell.attrs,
                        style: el.style.cssText,
                      });
                    }
                  });
                }
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
