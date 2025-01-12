<script lang="ts">
  import { tick } from "svelte";
  import { dndzone } from "svelte-dnd-action";
  import type {} from "@movabletype/mt-rich-text-editor/mt-rich-text-editor";

  const { textarea } = $props<{
    textarea: HTMLTextAreaElement;
  }>();

  type ToolbarItem = { id: string; element: string; isSentinel?: boolean };

  let isDragging = $state(false);

  const availableItems: ToolbarItem[] = JSON.parse(
    textarea.getAttribute("data-available-items") ?? "[]"
  ).map((id: string) => ({
    id,
    element: window.MTRichTextEditor.UI.getPanelItem("toolbar", id),
  }));

  function createSentinel(): ToolbarItem {
    return {
      id: `sentinel-${Math.random().toString(36).slice(2)}`,
      element: "div",
      isSentinel: true,
    };
  }

  function convertToItems(data: string[][][][]): ToolbarItem[][][][] {
    return data.map((groupSides) =>
      groupSides
        .concat([[], []])
        .slice(0, 2)
        .map((row) =>
          (row || []).map((group) => [
            ...group.map((id) => ({
              id,
              element: window.MTRichTextEditor.UI.getPanelItem("toolbar", id),
            })),
            createSentinel(),
          ])
        )
    );
  }

  function convertToData(items: ToolbarItem[][][][]): string[][][][] {
    return items.map((groupSides) =>
      groupSides.map((row) =>
        row.map((group) => group.filter((item) => !item.isSentinel).map((button) => button.id))
      )
    );
  }

  const toolbarItems = $state(convertToItems(JSON.parse(textarea.value)));

  $effect(() => {
    textarea.value = JSON.stringify(convertToData(toolbarItems));
  });

  let tmpUnusedItems = $state<ToolbarItem[] | undefined>(undefined);
  const unusedItems = $derived(
    tmpUnusedItems ?? availableItems.filter((item) => !getUsedItemIds(toolbarItems).has(item.id))
  );

  function hasEmptyRow(): boolean {
    const lastRow = toolbarItems[toolbarItems.length - 1];
    return !!(
      lastRow &&
      lastRow.every((side) => side.length === 1 && side[0].length === 1 && side[0][0].isSentinel)
    );
  }

  function addNewRowAndGroup() {
    toolbarItems.push([[[createSentinel()]], [[createSentinel()]]]);
  }

  function removeEmptyRow() {
    tick().then(() => {
      for (let i = toolbarItems.length - 1; i >= 0; i--) {
        const row = toolbarItems[i];
        if (
          row.every(
            (side) =>
              side.filter((group) => group.filter((item) => !item.isSentinel).length !== 0)
                .length === 0
          )
        ) {
          toolbarItems.splice(i, 1);
        }
      }
    });
  }

  function handleDndButton(
    rowIndex: number,
    sideIndex: number,
    groupIndex: number,
    e: CustomEvent<{ items: ToolbarItem[] }>,
    on: "consider" | "finalize"
  ) {
    const newItems = e.detail.items;
    const hasSentinel = newItems.some((item) => item.isSentinel);

    if (!hasSentinel) {
      newItems.push(createSentinel());
    }

    toolbarItems[rowIndex][sideIndex][groupIndex] = newItems;

    if (on === "consider" && !isDragging) {
      isDragging = true;
      tick().then(() => {
        addEmptyGroups();
      });
    }
  }

  function removeGroupIfEmpty(rowIndex: number, sideIndex: number, groupIndex: number) {
    if (
      toolbarItems[rowIndex][sideIndex][groupIndex].filter((item) => !item.isSentinel).length === 0
    ) {
      toolbarItems[rowIndex][sideIndex].splice(groupIndex, 1);
      if (toolbarItems[rowIndex][sideIndex].length === 0) {
        toolbarItems.splice(rowIndex, 1);
      }
    }
  }

  function removeButton(
    rowIndex: number,
    sideIndex: number,
    groupIndex: number,
    buttonIndex: number
  ) {
    toolbarItems[rowIndex][sideIndex][groupIndex].splice(buttonIndex, 1);
    removeGroupIfEmpty(rowIndex, sideIndex, groupIndex);
  }

  function getUsedItemIds(items: ToolbarItem[][][][]): Set<string> {
    const usedIds = new Set<string>();
    items.forEach((groupSides) => {
      groupSides.forEach((row) => {
        row.forEach((group) => {
          group.forEach((button) => {
            if (!button.isSentinel) {
              usedIds.add(button.id);
            }
          });
        });
      });
    });
    return usedIds;
  }

  function addEmptyGroups() {
    toolbarItems.forEach((groupSides) => {
      groupSides.forEach((row) => {
        if (!row.some((group) => group.length === 1 && group[0].isSentinel)) {
          row.push([createSentinel()]);
        }
      });
    });

    if (!hasEmptyRow()) {
      addNewRowAndGroup();
    }
  }

  function removeEmptyGroups() {
    for (let i = toolbarItems.length - 1; i >= 0; i--) {
      const groupSides = toolbarItems[i];
      for (let j = groupSides.length - 1; j >= 0; j--) {
        const row = groupSides[j];
        for (let k = row.length - 1; k >= 0; k--) {
          const group = row[k];
          if (group.length === 1 && group[0].isSentinel) {
            row.splice(k, 1);
          }
        }

        // preserve empty side
        // if (row.length === 0) {
        //   groupSides.splice(j, 1);
        // }
      }

      if (groupSides.length === 0) {
        toolbarItems.splice(i, 1);
      }
    }
  }
</script>

<div class="mt-rich-text-editor-toolbar-settings">
  {#each toolbarItems as row, rowIndex}
    <div class="mt-rich-text-editor-row">
      {#each row as side, sideIndex}
        <div class="mt-rich-text-editor-side">
          {#each side as group, groupIndex}
            <div class="mt-rich-text-editor-group">
              <div
                class="mt-rich-text-editor-buttons"
                use:dndzone={{
                  items: group,
                  flipDurationMs: 300,
                  dragDisabled: false,
                  dropFromOthersDisabled: false,
                }}
                onconsider={(e) => handleDndButton(rowIndex, sideIndex, groupIndex, e, "consider")}
                onfinalize={(e) => {
                  isDragging = false;
                  handleDndButton(rowIndex, sideIndex, groupIndex, e, "finalize");
                  removeGroupIfEmpty(rowIndex, sideIndex, groupIndex);
                  removeEmptyRow();
                  removeEmptyGroups();
                }}
              >
                {#each group as button, buttonIndex (button.id)}
                  {#if !button.isSentinel}
                    <div class="mt-rich-text-editor-button">
                      <button
                        type="button"
                        class="mt-rich-text-editor-remove-button"
                        onclick={() => removeButton(rowIndex, sideIndex, groupIndex, buttonIndex)}
                        title={window.trans("Remove")}
                        aria-label={window.trans("Remove")}
                      >
                        ×
                      </button>
                      <svelte:element this={button.element} />
                    </div>
                  {/if}
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  {/each}
</div>

{#if unusedItems.length > 0}
  <div class="mt-rich-text-editor-available-items">
    <h4>{window.trans("Available Items")}</h4>
    <div
      class="mt-rich-text-editor-available-buttons"
      use:dndzone={{
        items: unusedItems,
        flipDurationMs: 300,
        dragDisabled: false,
        dropFromOthersDisabled: false,
      }}
      onconsider={(e) => {
        tmpUnusedItems = e.detail.items;
        console.log(e.detail.items);

        if (!isDragging) {
          isDragging = true;
          tick().then(() => {
            addEmptyGroups();
          });
        }
      }}
      onfinalize={() => {
        tmpUnusedItems = undefined;

        isDragging = false;
        removeEmptyRow();
        removeEmptyGroups();
      }}
    >
      {#each unusedItems as item (item.id)}
        <div class="mt-rich-text-editor-button">
          <svelte:element this={item.element} />
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .mt-rich-text-editor-toolbar-settings {
    padding: 1rem;
  }

  .mt-rich-text-editor-row {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 0.5rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .mt-rich-text-editor-side {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .mt-rich-text-editor-group {
    display: inline-block;
    padding: 0.5rem;
    background: #fff;
    border-radius: 4px;
    background: #f5f5f5;
  }

  .mt-rich-text-editor-button {
    display: inline-flex;
    align-items: center;
    margin: 0.25rem;
    padding: 0.25rem 0.5rem;
    border-radius: 3px;
    position: relative;
    border: 1px solid #ccc;
    background: #fff;
  }

  .mt-rich-text-editor-remove-button {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 16px;
    height: 16px;
    line-height: 14px;
    border: none;
    background: #fff;
    color: #999;
    cursor: pointer;
    border-radius: 50%;
    font-size: 12px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .mt-rich-text-editor-remove-button:hover {
    color: #f00;
    background: #fff;
  }

  .mt-rich-text-editor-available-items {
    padding: 0 1rem 1rem;
  }

  .mt-rich-text-editor-available-items h4 {
    margin: 0 0 1rem;
    font-size: 1rem;
    color: #666;
  }

  .mt-rich-text-editor-available-buttons {
    min-height: 50px;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.5rem;
    background: #fff;
    border-radius: 4px;
    border: 1px solid #ccc;
  }

  .mt-rich-text-editor-buttons {
    min-height: 2rem;
    min-width: 3rem;
  }

  .mt-rich-text-editor-group:has(.mt-rich-text-editor-buttons:empty) {
    min-width: 5rem;
    min-height: 3rem;
    background-color: #f8f8f8;
    border: 1px dashed #ccc;
  }

  .mt-rich-text-editor-group:has(.mt-rich-text-editor-buttons:empty):hover {
    background-color: #f0f0f0;
    border-color: #ccc;
  }
</style>
