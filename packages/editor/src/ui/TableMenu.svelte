<script lang="ts">
  import { mount, unmount } from "svelte";
  import type { Editor } from "../editor";
  import Menu from "./Menu.svelte";
  import MenuItemGroup from "./MenuItemGroup.svelte";
  import MenuItem from "./MenuItem.svelte";
  import Modal from "./table/Modal.svelte";
  import type { TableData } from "./table/Modal.svelte";
  import TableProperties from "./icon/tableProperties.svg?raw";
  import TableDelete from "./icon/tableDelete.svg?raw";
  import TableInsertRowTop from "./icon/tableInsertRowTop.svg?raw";
  import TableInsertRowBottom from "./icon/tableInsertRowBottom.svg?raw";
  import TableDeleteRow from "./icon/tableDeleteRow.svg?raw";
  import TableInsertColumnLeft from "./icon/tableInsertColumnLeft.svg?raw";
  import TableInsertColumnRight from "./icon/tableInsertColumnRight.svg?raw";
  import TableDeleteColumn from "./icon/tableDeleteColumn.svg?raw";

  const {
    editor,
  }: {
    editor: Editor;
  } = $props();

  const tiptap = editor.tiptap;
  const state = tiptap.state;

  let modal: ReturnType<typeof mount> | null = null;

  function getCurrentTableWidth(): string {
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
  }

  function getTableNodePos(): number | null {
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
  }
</script>

<Menu
  {editor}
  targetNodeName="table"
  condition={() => {
    const isEmptyCursorInTable =
      state.selection.empty &&
      (tiptap.isActive("table") || tiptap.isActive("tableRow") || tiptap.isActive("tableCell"));
    const isCellSelection =
      (state.selection as any).$headCell && (state.selection as any).$anchorCell;
    return isCellSelection || isEmptyCursorInTable;
  }}
>
  <MenuItemGroup>
    <MenuItem
      onclick={() => {
        modal = mount(Modal, {
          target: document.body,
          props: {
            tableData: {
              width: getCurrentTableWidth(),
            },
            onSubmit: (tableData: TableData) => {
              const tablePos = getTableNodePos();
              if (tablePos !== null) {
                tiptap
                  .chain()
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
              unmount(modal as ReturnType<typeof mount>);
            },
            onClose: () => {
              unmount(modal as ReturnType<typeof mount>);
            },
          },
        });
      }}>{@html TableProperties}</MenuItem
    >
    <MenuItem
      onclick={() => {
        tiptap.chain().focus().deleteTable().run();
      }}>{@html TableDelete}</MenuItem
    >
  </MenuItemGroup>
  <MenuItemGroup>
    <MenuItem
      onclick={() => {
        tiptap.chain().focus().addRowBefore().run();
      }}>{@html TableInsertRowTop}</MenuItem
    >
    <MenuItem
      onclick={() => {
        tiptap.chain().focus().addRowAfter().run();
      }}>{@html TableInsertRowBottom}</MenuItem
    >
    <MenuItem
      onclick={() => {
        tiptap.chain().focus().deleteRow().run();
      }}>{@html TableDeleteRow}</MenuItem
    >
  </MenuItemGroup>
  <MenuItemGroup>
    <MenuItem
      onclick={() => {
        tiptap.chain().focus().addColumnBefore().run();
      }}>{@html TableInsertColumnLeft}</MenuItem
    >
    <MenuItem
      onclick={() => {
        tiptap.chain().focus().addColumnAfter().run();
      }}>{@html TableInsertColumnRight}</MenuItem
    >
    <MenuItem
      onclick={() => {
        tiptap.chain().focus().deleteColumn().run();
      }}>{@html TableDeleteColumn}</MenuItem
    >
  </MenuItemGroup>
</Menu>
