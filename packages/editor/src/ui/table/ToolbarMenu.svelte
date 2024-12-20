<script lang="ts">
  import { t } from "../../i18n";
  import TableInsertPanel from "./TableInsertPanel.svelte";

  let {
    onSubmit,
    onClose,
  }: {
    onSubmit: (text: string) => void;
    onClose: () => void;
  } = $props();

  let showInsertPanel = $state(false);
  let insertPanelRef: HTMLDivElement;

  function handleMouseEnter() {
    showInsertPanel = true;
  }

  function handleMouseLeave(event: MouseEvent) {
    if (!insertPanelRef?.contains(event.relatedTarget as Node)) {
      showInsertPanel = false;
    }
  }

  function handleTableInsert(rows: number, cols: number) {
    const table = document.createElement("table");
    for (let i = 0; i < rows; i++) {
      const row = document.createElement("tr");
      for (let j = 0; j < cols; j++) {
        const cell = document.createElement("td");
        row.appendChild(cell);
      }
      table.appendChild(row);
    }
    onSubmit(table.outerHTML);
    onClose();
  }
</script>

<div class="mt_table_toolbar_menu_container">
  <div class="mt_table_toolbar_menu">
    <button type="button" onmouseenter={handleMouseEnter} onmouseleave={handleMouseLeave}>
      {t("Table")}
    </button>

    {#if showInsertPanel}
      <div class="insert_panel_wrapper" bind:this={insertPanelRef} onmouseleave={handleMouseLeave}>
        <TableInsertPanel onInsert={handleTableInsert} />
      </div>
    {/if}
  </div>
</div>

<style>
  .mt_table_toolbar_menu_container {
    position: relative;
  }

  .mt_table_toolbar_menu {
    position: absolute;
    top: 0;
    left: 0;
    width: 80px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 1px;
    z-index: 1;
  }

  .mt_table_toolbar_menu button {
    width: 100% !important;
    text-align: left;
  }

  .insert_panel_wrapper {
    position: absolute;
    left: 100%;
    top: 0;
  }
</style>
