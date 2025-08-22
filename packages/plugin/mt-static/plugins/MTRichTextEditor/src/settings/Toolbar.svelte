<script lang="ts">
  import { tick } from "svelte";
  import { dndzone } from "svelte-dnd-action";
  import { flipDurationMs, dropTargetStyle } from "./common";

  const { textarea } = $props<{
    textarea: HTMLTextAreaElement;
  }>();

  type ToolbarItem = { id: string; element: string; isSentinel?: boolean; isToolbarItem: true };

  let isDragging = $state(false);

  const availableItems: ToolbarItem[] = JSON.parse(
    textarea.getAttribute("data-available-items") ?? "[]"
  ).map((id: string) => ({
    id: `toolbar-item-${id}`,
    element: window.MTRichTextEditor.Component.getPanelItem("toolbar", id),
    isToolbarItem: true,
  }));

  function createSentinel(): ToolbarItem {
    return {
      id: `sentinel-${Math.random().toString(36).slice(2)}`,
      element: "div",
      isSentinel: true,
      isToolbarItem: true,
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
              id: `toolbar-item-${id}`,
              element: window.MTRichTextEditor.Component.getPanelItem("toolbar", id) ?? "div",
              isToolbarItem: true,
            })),
            createSentinel(),
          ])
        )
    ) as ToolbarItem[][][][];
  }

  function convertToData(items: ToolbarItem[][][][]): string[][][][] {
    return items
      .map((groupSides) =>
        groupSides
          .map((row) =>
            row
              .map((group) =>
                group
                  .filter((item) => !item.isSentinel)
                  .map((button) => button.id.replace(/^toolbar-item-/, ""))
              )
              .filter((group) => group.length > 0)
          )
          .filter((row) => row.length > 0)
      )
      .filter((groupSides) => groupSides.length > 0);
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
    { detail: { items, info } }: CustomEvent<{ items: ToolbarItem[]; info: { id: string } }>,
    on: "consider" | "finalize"
  ) {
    if (!info.id.startsWith("toolbar-item-")) {
      return;
    }

    const newItems = items;
    const hasSentinel = newItems.some((item) => item.isSentinel);

    if (!hasSentinel) {
      newItems.push(createSentinel());
    }

    // Remove duplicates because items are sometimes passed in duplicate, causing errors
    toolbarItems[rowIndex][sideIndex][groupIndex] = newItems.filter(
      (item, index, self) => self.findIndex((i) => i.element === item.element) === index
    );

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
      if (toolbarItems[rowIndex].every((side) => side.length === 0)) {
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

  const styleEl = document.createElement("style");
  const elementStyles: Record<string, string> = {};
  $effect(() => {
    document.head.appendChild(styleEl);
    return () => {
      styleEl.remove();
    };
  });

  const fixSize = (el: HTMLElement) => {
    setTimeout(() => {
      const { width, height } = getComputedStyle(el);
      el.style.minWidth = width;
      el.style.minHeight = height;
      elementStyles[el.tagName.toLowerCase()] = el.style.cssText;

      styleEl.textContent = Object.entries(elementStyles)
        .map(([tag, styles]) => `${tag} { ${styles} }`)
        .join("\n");
    });
  };
</script>

<div class="mt-rich-text-editor-toolbar-settings">
  <!-- eslint-disable-next-line svelte/require-each-key -->
  {#each toolbarItems as row, rowIndex}
    <div class="mt-rich-text-editor-row">
      <!-- eslint-disable-next-line svelte/require-each-key -->
      {#each row as side, sideIndex}
        {#if side.length > 0}
          <div class="mt-rich-text-editor-side">
            <!-- eslint-disable-next-line svelte/require-each-key -->
            {#each side as group, groupIndex}
              <div class="mt-rich-text-editor-group">
                <div
                  class="mt-rich-text-editor-buttons"
                  use:dndzone={{
                    items: group,
                    flipDurationMs,
                    dropTargetStyle,
                    dragDisabled: false,
                    dropFromOthersDisabled: false,
                  }}
                  onconsider={(e) =>
                    handleDndButton(rowIndex, sideIndex, groupIndex, e, "consider")}
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
                        <svelte:element
                          this={button.element}
                          class="mt-rich-text-editor-button-element"
                          use:fixSize
                        />
                      </div>
                    {/if}
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        {/if}
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
        flipDurationMs,
        dropTargetStyle,
        dragDisabled: false,
        dropFromOthersDisabled: true,
      }}
      onconsider={({ detail: { items } }: CustomEvent<{ items: ToolbarItem[] }>) => {
        tmpUnusedItems = items;

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
        tick().then(() => {
          document
            .querySelectorAll<HTMLDivElement>(
              ".mt-rich-text-editor-available-buttons .mt-rich-text-editor-button"
            )
            .forEach((button) => {
              // Reset visibility:hidden, which is set while dragging, as it may not return.
              button.style.visibility = "";
            });
        });
      }}
    >
      {#each unusedItems as item (item.id)}
        <div class="mt-rich-text-editor-button">
          <svelte:element
            this={item.element}
            class="mt-rich-text-editor-button-element"
            use:fixSize
          />
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

  .mt-rich-text-editor-button-element {
    pointer-events: none;
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
    display: flex;
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
