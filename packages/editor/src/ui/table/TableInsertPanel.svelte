<script lang="ts">
//   import { t } from "../../../i18n";

  export let onInsert: (rows: number, cols: number) => void;

  let hoveredRows = 0;
  let hoveredCols = 0;
  const MAX_ROWS = 10;
  const MAX_COLS = 10;

  function handleCellHover(row: number, col: number) {
    hoveredRows = row + 1;
    hoveredCols = col + 1;
  }

  function handleClick() {
    if (hoveredRows && hoveredCols) {
      onInsert(hoveredRows, hoveredCols);
    }
  }
</script>

<div class="table_insert_panel">
  <div class="size_indicator">
    {#if hoveredRows && hoveredCols}
      {hoveredRows} x {hoveredCols}
    {/if}
  </div>
  <div class="grid_container" on:click={handleClick}>
    {#each Array(MAX_ROWS) as _, row}
      <div class="grid_row">
        {#each Array(MAX_COLS) as _, col}
          <div
            class="grid_cell"
            class:selected={row < hoveredRows && col < hoveredCols}
            on:mouseover={() => handleCellHover(row, col)}
          />
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  .table_insert_panel {
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .size_indicator {
    text-align: center;
    margin-bottom: 8px;
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
    width: 16px;
    height: 16px;
    border: 1px solid #ddd;
    background: #fff;
    cursor: pointer;
  }

  .grid_cell.selected {
    background: #0066cc;
    border-color: #0066cc;
  }
</style> 
