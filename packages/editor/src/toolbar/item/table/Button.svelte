<svelte:options
  customElement={{
    extend: extendToolbarItem,
  }}
/>

<script module lang="ts">
  import { extendToolbarItem } from "../svelte";
</script>

<script lang="ts">
  import { t } from "../../../i18n";
  import icon from "../../../ui/icon/table.svg?raw";
  import { tooltip } from "../../../tooltip";
  import TableInsertPanel from "./TableInsertPanel.svelte";
  import type { ToolbarItemElement } from "../element";

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

<button use:tooltip={t("Table")}>
  {@html icon}
</button>

<div class="table-insert-panel-container">
  {#if isOpen}
    <TableInsertPanel onInsert={handleInsert} />
  {/if}
</div>

<style>
  .table-insert-panel-container {
    position: relative;
    z-index: 1;
  }
</style>
