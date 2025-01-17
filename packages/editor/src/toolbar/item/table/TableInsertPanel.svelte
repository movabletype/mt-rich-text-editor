<script lang="ts">
  //   import { t } from "../../../i18n";

  const {
    onInsert,
  }: {
    onInsert: (rows: number, cols: number) => void;
  } = $props();

  let hoveredRows = $state(0);
  let hoveredCols = $state(0);
  const MAX_ROWS = 20;
  const MAX_COLS = 20;
  const DEFAULT_ROWS = 10;
  const DEFAULT_COLS = 10;

  const maxRows = $derived(Math.min(MAX_ROWS, Math.max(DEFAULT_ROWS, hoveredRows + 1)));
  const maxCols = $derived(Math.min(MAX_COLS, Math.max(DEFAULT_COLS, hoveredCols + 1)));

  function handleCellHover(row: number, col: number) {
    hoveredRows = row + 1;
    hoveredCols = col + 1;
  }

  function handleClick(ev: MouseEvent) {
    ev.stopPropagation();
    if (hoveredRows && hoveredCols) {
      onInsert(hoveredRows, hoveredCols);
    }
  }
</script>

<div class="table_insert_panel">
  <div class="grid_container" on:click={handleClick}>
    {#each Array(maxRows) as _, row}
      <div class="grid_row">
        {#each Array(maxCols) as _, col}
          <div
            class="grid_cell"
            class:selected={row < hoveredRows && col < hoveredCols}
            on:mouseover={() => handleCellHover(row, col)}
          />
        {/each}
      </div>
    {/each}
  </div>
  <div class="size_indicator">
    {#if hoveredRows && hoveredCols}
      {hoveredRows} x {hoveredCols}
    {/if}
  </div>
</div>

<style>
  .table_insert_panel {
    position: absolute;
    top: 0;
    left: 0;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 8px 8px 0 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .size_indicator {
    text-align: center;
    margin: 4px 0;
    height: 20px;
    font-size: 12px;
  }

  .grid_container {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .grid_row {
    display: flex;
    gap: 2px;
  }

  .grid_cell {
    width: 12px;
    height: 12px;
    border: 1px solid #ddd;
    background: #fff;
    cursor: pointer;
  }

  .grid_cell.selected {
    background: #0066cc;
    border-color: #0066cc;
  }
</style>
