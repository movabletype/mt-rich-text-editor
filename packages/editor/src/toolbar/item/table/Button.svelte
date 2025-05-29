<svelte:options
  customElement={{
    extend: extendToolbarItem,
  }}
/>

<script module lang="ts">
  import { extendToolbarItem } from "../svelte";
</script>

<script lang="ts">
  import { selectedRect } from "@tiptap/pm/tables";
  import { t } from "../../../i18n";
  import icon from "../../../ui/icon/table.svg?raw";
  import { tooltip } from "../../../tooltip";
  import TableInsertPanel from "./TableInsertPanel.svelte";
  import type { ToolbarItemElement } from "../element";
  import { handleTableProperties } from "./table-properties";
  import { handleCellProperties } from "./cell-properties";
  import { handleRowProperties } from "./row-properties";

  const element = $host<ToolbarItemElement>();
  const { tiptap } = element;

  element.addEventListener("click", toggleTableInsertPanel);

  let isOpen = $state(false);
  let isTableActive = $state(tiptap?.isActive("table"));

  let canMergeCell = $state<boolean>(false);
  let canSplitCell = $state<boolean>(false);

  const update = () => {
    if (!tiptap) {
      return;
    }

    isTableActive = tiptap.isActive("table");
    const tableRect = isTableActive ? selectedRect(tiptap.state) : null;
    if (tableRect) {
      const selectedCells = new Set();
      let canSplitCellSelected = false;
      const map = tableRect.map;
      RECT_LOOP: for (let row = tableRect.top; row < tableRect.bottom; row++) {
        for (let col = tableRect.left; col < tableRect.right; col++) {
          const cellPos = map.map[row * map.width + col];
          const cell = tableRect.table.nodeAt(cellPos);
          if (cell) {
            selectedCells.add(cell);
            canSplitCellSelected = cell.attrs.colspan > 1 || cell.attrs.rowspan > 1;
            if (canSplitCellSelected && selectedCells.size > 1) {
              break RECT_LOOP;
            }
          }
        }
      }
      canSplitCell = canSplitCellSelected;
      canMergeCell = selectedCells.size > 1;
    }
  };
  tiptap?.on("update", update);
  tiptap?.on("selectionUpdate", update);

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

  let showSubMenu = $state<Record<string, boolean>>({});
  $effect(() => {
    if (!isOpen) {
      showSubMenu = {};
    }
  });
</script>

<button use:tooltip={t("Table")}>
  {@html icon}
</button>

<div class="button-menu-container">
  {#if isOpen}
    <div class="button-menu">
      <div
        class="button-menu-item-group button-menu-item-group--insert"
        onmouseenter={() => (showSubMenu.insert = true)}
        onmouseleave={() => (showSubMenu.insert = false)}
        role="menuitem"
        tabindex="0"
      >
        <div class="button-menu-item-group-label">{t("Insert table")}</div>
        {#if showSubMenu.insert}
          <div class="button-menu-item-subgroup">
            <TableInsertPanel onInsert={handleInsert} />
          </div>
        {/if}
      </div>
      <div
        class="button-menu-item-group"
        onmouseenter={() => (showSubMenu.cell = true)}
        onmouseleave={() => (showSubMenu.cell = false)}
        role="menuitem"
        tabindex="0"
      >
        <div class="button-menu-item-group-label">{t("Cell")}</div>
        {#if showSubMenu.cell}
          <div class="button-menu-item-subgroup">
            <button
              class="button-menu-item"
              disabled={!(isTableActive && canMergeCell)}
              onclick={() => {
                tiptap?.chain().focus().mergeCells().run();
              }}
            >
              {t("Merge cells")}
            </button>
            <button
              class="button-menu-item"
              disabled={!(isTableActive && canSplitCell)}
              onclick={() => {
                tiptap?.chain().focus().splitCell().run();
              }}
            >
              {t("Split cell")}
            </button>
            <button
              class="button-menu-item"
              disabled={!isTableActive}
              onclick={() => {
                handleCellProperties(tiptap!);
              }}>{t("Cell properties")}</button
            >
          </div>
        {/if}
      </div>
      <div
        class="button-menu-item-group"
        onmouseenter={() => (showSubMenu.row = true)}
        onmouseleave={() => (showSubMenu.row = false)}
        role="menuitem"
        tabindex="0"
      >
        <div class="button-menu-item-group-label">{t("Row")}</div>
        {#if showSubMenu.row}
          <div class="button-menu-item-subgroup">
            <button
              class="button-menu-item"
              disabled={!isTableActive}
              onclick={() => {
                tiptap?.chain().focus().addRowBefore().run();
              }}
            >
              {t("Insert row before")}
            </button>
            <button
              class="button-menu-item"
              disabled={!isTableActive}
              onclick={() => {
                tiptap?.chain().focus().addRowAfter().run();
              }}
            >
              {t("Insert row after")}
            </button>
            <button
              class="button-menu-item"
              disabled={!isTableActive}
              onclick={() => {
                tiptap?.chain().focus().deleteRow().run();
              }}
            >
              {t("Delete row")}
            </button>
            {#if false}
              <!-- TODO: implement row properties -->
              <button
                class="button-menu-item"
                disabled={!isTableActive}
                onclick={() => {
                  handleRowProperties(tiptap!);
                }}>{t("Row properties")}</button
              >
            {/if}
          </div>
        {/if}
      </div>
      <div
        class="button-menu-item-group"
        onmouseenter={() => (showSubMenu.col = true)}
        onmouseleave={() => (showSubMenu.col = false)}
        role="menuitem"
        tabindex="0"
      >
        <div class="button-menu-item-group-label">{t("Column")}</div>
        {#if showSubMenu.col}
          <div class="button-menu-item-subgroup">
            <button
              class="button-menu-item"
              disabled={!isTableActive}
              onclick={() => {
                tiptap?.chain().focus().addColumnBefore().run();
              }}
            >
              {t("Insert column before")}
            </button>
            <button
              class="button-menu-item"
              disabled={!isTableActive}
              onclick={() => {
                tiptap?.chain().focus().addColumnAfter().run();
              }}
            >
              {t("Insert column after")}
            </button>
            <button
              class="button-menu-item"
              disabled={!isTableActive}
              onclick={() => {
                tiptap?.chain().focus().deleteColumn().run();
              }}
            >
              {t("Delete column")}
            </button>
          </div>
        {/if}
      </div>
      <div class="button-menu-item-group">
        <button
          class="button-menu-item"
          disabled={!isTableActive}
          onclick={() => {
            handleTableProperties(tiptap!);
          }}
        >
          {t("Table properties")}
        </button>
        <button
          class="button-menu-item"
          disabled={!isTableActive}
          onclick={() => {
            tiptap?.chain().focus().deleteTable().run();
          }}
        >
          {t("Delete table")}
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .button-menu-container {
    position: relative;
    z-index: 3;
  }

  .button-menu {
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    flex-direction: column;
    border-radius: 4px;
    box-shadow: 0 0 0 1px #ccc;
    background: white;
  }

  .button-menu-item-group {
    position: relative;
    background: white;

    &:first-child {
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }

    &:hover .button-menu-item-group-label {
      background: #dee0e2;
    }
  }

  .button-menu-item-group--insert {
    border-bottom: 1px solid #ccc;
  }

  .button-menu-item-group-label {
    font-size: 0.85rem;
    padding: 5px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &:after {
      content: ">";
      font-weight: bold;
      font-size: 0.85rem;
    }
  }

  .button-menu-item-subgroup {
    position: absolute;
    left: calc(100% + 1px);
    top: 0;
    border-radius: 4px;

    .button-menu-item:first-child {
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }
  }

  .button-menu-item {
    font-size: 0.85rem;
    border: none;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 5px 10px;
    width: 100%;
    background: white;
    box-shadow: 0 0 0 1px #ccc;
    white-space: nowrap;

    &:last-child {
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
    }

    &:hover {
      background: #dee0e2;
    }
  }
</style>
