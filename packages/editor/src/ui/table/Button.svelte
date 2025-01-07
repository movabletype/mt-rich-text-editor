<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-toolbar-item-table",
    extend: extend,
  }}
/>

<script module lang="ts">
  import { extend } from "../item/registry/svelte";
</script>

<script lang="ts">
  import icon from "../icon/table.svg?raw";
  import TableInsertPanel from "./TableInsertPanel.svelte";
  import type { Props } from "../item/registry/svelte";

  const { tiptap, onUpdate }: Props = $props();
  let isOpen = $state(false);

  onUpdate(() => {
    // TBD
  });

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

<div onclick={toggleTableInsertPanel} class="icon">
  {@html icon}
</div>

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
