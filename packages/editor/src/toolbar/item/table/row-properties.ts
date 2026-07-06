import { mount, unmount } from "svelte";
import type { Editor as TiptapEditor } from "@tiptap/core";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { RowData } from "./RowPropertiesPanel.svelte";
import RowPropertiesPanel from "./RowPropertiesPanel.svelte";

let rowPropertiesModal: ReturnType<typeof mount> | undefined;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handleRowProperties = (tiptap: TiptapEditor) => {
  rowPropertiesModal = mount(RowPropertiesPanel, {
    target: document.body,
    props: {
      rowData: {
        element: "tbody",
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onSubmit: (rowData: RowData) => {
        unmount(rowPropertiesModal as ReturnType<typeof mount>);
      },
      onClose: () => {
        unmount(rowPropertiesModal as ReturnType<typeof mount>);
      },
    },
  });
};
