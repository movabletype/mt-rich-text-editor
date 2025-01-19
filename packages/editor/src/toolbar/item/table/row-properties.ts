import { mount, unmount } from "svelte";
import type { Editor as TiptapEditor } from "@tiptap/core";
import type { RowData } from "./RowPropertiesPanel.svelte";
import RowPropertiesPanel from "./RowPropertiesPanel.svelte";

let tablePropertiesModal: ReturnType<typeof mount> | undefined;
export function handleRowProperties(tiptap: TiptapEditor) {
  mount(RowPropertiesPanel, {
    target: document.body,
    props: {
      rowData: {
        element: "tbody",
      },
      onSubmit: (rowData: RowData) => {
        console.log(rowData);
        unmount(tablePropertiesModal as ReturnType<typeof mount>);
      },
      onClose: () => {
        unmount(tablePropertiesModal as ReturnType<typeof mount>);
      },
    },
  });
}
