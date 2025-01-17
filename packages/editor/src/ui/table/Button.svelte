<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-toolbar-item-table",
    extend: extendToolbarItem,
  }}
/>

<script module lang="ts">
  import { extendToolbarItem } from "../item/registry/svelte";
</script>

<script lang="ts">
  import { t } from "../../i18n";
  import icon from "../icon/table.svg?raw";
  import ToolbarButton from "../ToolbarButton.svelte";
  import TableInsertPanel from "./TableInsertPanel.svelte";
  import type { ToolbarItemElement } from "../item/element";

  const element = $host<ToolbarItemElement>();
  const { tiptap } = element;

  element.addEventListener("click", toggleTableInsertPanel);

  let isOpen = $state(false);

  function handleInsert(rows: number, cols: number) {
    tiptap?.chain().focus().insertTable({ rows, cols, withHeaderRow: false }).run();
    isOpen = false;
  }

  function toggleTableInsertPanel(ev: MouseEvent) {
    if (!tiptap) {
      return;
    }
    ev.stopPropagation();
    isOpen = !isOpen;
  }

  function handleClickOutside() {
    isOpen = false;
  }

  $effect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });
</script>

<ToolbarButton title={t("Table")}>
  {@html icon}
</ToolbarButton>

<div class="table-insert-panel-container">
  {#if isOpen}
    <TableInsertPanel onInsert={handleInsert} />
  {/if}
</div>

<style>
  .icon {
    width: 24px;
    height: 24px;
  }
  .table-insert-panel-container {
    position: relative;
    z-index: 1;
  }
</style>
