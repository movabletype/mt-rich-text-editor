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
  import { handleTableProperties } from "./table-properties";
  import { handleCellProperties } from "./cell-properties";
  import { handleRowProperties } from "./row-properties";

  const element = $host<ToolbarItemElement>();
  const { tiptap } = element;

  element.addEventListener("click", toggleTableInsertPanel);

  let isOpen = $state(false);
  let isTableActive = $state(tiptap?.isActive("table"));
  tiptap?.on("update", () => {
    isTableActive = tiptap?.isActive("table");
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

<div class="menu-container">
  {#if isOpen}
    <div class="menu">
      <div
        class="menu-item-group menu-item-group--insert"
        onmouseenter={() => (showSubMenu.insert = true)}
        onmouseleave={() => (showSubMenu.insert = false)}
        role="menuitem"
        tabindex="0"
      >
        <div class="menu-item-group-label">{t("Insert table")}</div>
        {#if showSubMenu.insert}
          <div class="menu-item-subgroup">
            <TableInsertPanel onInsert={handleInsert} />
          </div>
        {/if}
      </div>
      <div
        class="menu-item-group"
        onmouseenter={() => (showSubMenu.cell = true)}
        onmouseleave={() => (showSubMenu.cell = false)}
        role="menuitem"
        tabindex="0"
      >
        <div class="menu-item-group-label">{t("Cell")}</div>
        {#if showSubMenu.cell}
          <div class="menu-item-subgroup">
            <button
              class="menu-item"
              disabled={!isTableActive}
              onclick={() => {
                tiptap?.chain().focus().mergeCells().run();
              }}
            >
              {t("Merge cells")}
            </button>
            <button
              class="menu-item"
              disabled={!isTableActive}
              onclick={() => {
                tiptap?.chain().focus().splitCell().run();
              }}
            >
              {t("Split cell")}
            </button>
            <button
              class="menu-item"
              disabled={!isTableActive}
              onclick={() => {
                handleCellProperties(tiptap!);
              }}>{t("Cell properties")}</button
            >
          </div>
        {/if}
      </div>
      <div
        class="menu-item-group"
        onmouseenter={() => (showSubMenu.row = true)}
        onmouseleave={() => (showSubMenu.row = false)}
        role="menuitem"
        tabindex="0"
      >
        <div class="menu-item-group-label">{t("Row")}</div>
        {#if showSubMenu.row}
          <div class="menu-item-subgroup">
            <button
              class="menu-item"
              disabled={!isTableActive}
              onclick={() => {
                tiptap?.chain().focus().addRowBefore().run();
              }}
            >
              {t("Insert row before")}
            </button>
            <button
              class="menu-item"
              disabled={!isTableActive}
              onclick={() => {
                tiptap?.chain().focus().addRowAfter().run();
              }}
            >
              {t("Insert row after")}
            </button>
            <button
              class="menu-item"
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
                class="menu-item"
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
        class="menu-item-group"
        onmouseenter={() => (showSubMenu.col = true)}
        onmouseleave={() => (showSubMenu.col = false)}
        role="menuitem"
        tabindex="0"
      >
        <div class="menu-item-group-label">{t("Column")}</div>
        {#if showSubMenu.col}
          <div class="menu-item-subgroup">
            <button
              class="menu-item"
              disabled={!isTableActive}
              onclick={() => {
                tiptap?.chain().focus().addColumnBefore().run();
              }}
            >
              {t("Insert column before")}
            </button>
            <button
              class="menu-item"
              disabled={!isTableActive}
              onclick={() => {
                tiptap?.chain().focus().addColumnAfter().run();
              }}
            >
              {t("Insert column after")}
            </button>
            <button
              class="menu-item"
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
      <div class="menu-item-group">
        <button
          class="menu-item"
          disabled={!isTableActive}
          onclick={() => {
            handleTableProperties(tiptap!);
          }}
        >
          {t("Table properties")}
        </button>
        <button
          class="menu-item"
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
  .menu-container {
    position: relative;
    z-index: 3;
  }

  .menu {
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    flex-direction: column;
    border-radius: 4px;
    box-shadow: 0 0 0 1px #ccc;
    background: white;
  }

  .menu-item-group {
    position: relative;
    background: white;

    &:first-child {
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }

    &:hover .menu-item-group-label {
      background: #dee0e2;
    }
  }

  .menu-item-group--insert {
    border-bottom: 1px solid #ccc;
  }

  .menu-item-group-label {
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

  .menu-item-subgroup {
    position: absolute;
    left: calc(100% + 1px);
    top: 0;
    border-radius: 4px;

    .menu-item:first-child {
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }
  }

  .menu-item {
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

    &:last-child {
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
    }

    &:hover {
      background: #dee0e2;
    }
  }
</style>
