<script lang="ts">
  import { dndzone } from "svelte-dnd-action";
  import type {} from "@movabletype/mt-rich-text-editor/mt-rich-text-editor";
  import moveIcon from "../asset/move.svg?raw";
  import trashIcon from "../asset/trash.svg?raw";

  const { textarea } = $props<{
    textarea: HTMLTextAreaElement;
  }>();

  type BlockItem = { value: string; label: string };
  type BlockInternalItem = { id: string; value: string; label: string };

  const availableBlocks: BlockInternalItem[] = convertToItems(JSON.parse(
    textarea.getAttribute("data-available-blocks") ?? "[]"
  ));

  function convertToItems(data: BlockItem[]): BlockInternalItem[] {
    return data.map((item) => ({
      id: item.value,
      value: item.value,
      label: item.label,
    }));
  }

  function convertToData(items: BlockInternalItem[]): BlockItem[] {
    return items.map((item) => ({
      value: item.value,
      label: item.label,
    }));
  }

  let blocksItems = $state(convertToItems(JSON.parse(textarea.value)));
  const unusedItems = $derived(
    availableBlocks.filter((item) => !getUsedItems(blocksItems).has(item.value))
  );

  function getUsedItems(items: BlockInternalItem[]): Set<string> {
    return new Set(items.map((item) => item.value));
  }

  // Handle DnD events for current blocks
  function handleDndConsider(e: CustomEvent<{ items: BlockInternalItem[] }>) {
    blocksItems = e.detail.items;
  }

  function handleDndFinalize(e: CustomEvent<{ items: BlockInternalItem[] }>) {
    blocksItems = e.detail.items;
  }

  // Handle DnD events for available blocks
  function handleAvailableDndConsider(e: CustomEvent<{ items: BlockInternalItem[] }>) {
    const draggedItem = e.detail.items[0];
    if (draggedItem && !getUsedItems(blocksItems).has(draggedItem.value)) {
      blocksItems = [...blocksItems, draggedItem];
    }
  }

  function handleAvailableDndFinalize() {}

  // Remove block
  function handleRemoveBlock(id: string) {
    blocksItems = blocksItems.filter((item) => item.id !== id);
  }

  // Update label
  function handleUpdateLabel(id: string, newLabel: string) {
    blocksItems = blocksItems.map((item) => (item.id === id ? { ...item, label: newLabel } : item));
  }

  $effect(() => {
    textarea.value = JSON.stringify(convertToData(blocksItems));
  });
</script>

<div class="mt-rich-text-editor-blocks-settings">
  <!-- Current blocks -->
  <div class="mt-rich-text-editor-blocks-settings-current">
    <section
      use:dndzone={{ items: blocksItems, flipDurationMs: 0 }}
      onconsider={handleDndConsider}
      onfinalize={handleDndFinalize}
    >
      {#each blocksItems as item (item.id)}
        <div class="mt-rich-text-editor-blocks-settings-item">
          <span class="mt-rich-text-editor-blocks-settings-move">
            {@html moveIcon}
          </span>
          <input
            type="text"
            value={item.label}
            oninput={(e) => handleUpdateLabel(item.id, e.currentTarget.value)}
          />
          <span class="mt-rich-text-editor-blocks-settings-value">{item.value}</span>
          <button
            class="mt-rich-text-editor-blocks-settings-remove"
            type="button"
            onclick={() => handleRemoveBlock(item.id)}
            title={window.trans("Remove")}
            aria-label={window.trans("Remove")}
          >
            {@html trashIcon}
          </button>
        </div>
      {/each}
    </section>
  </div>

  <!-- Available blocks -->
  <div class="mt-rich-text-editor-blocks-settings-available">
    <h4>{window.trans("Available Blocks")}</h4>
    <section
      use:dndzone={{ items: unusedItems, flipDurationMs: 0 }}
      onconsider={handleAvailableDndConsider}
      onfinalize={handleAvailableDndFinalize}
    >
      {#each unusedItems as item (item.value)}
        <div class="mt-rich-text-editor-blocks-settings-item">
          <span class="mt-rich-text-editor-blocks-settings-move">
            {@html moveIcon}
          </span>
          <span class="mt-rich-text-editor-blocks-settings-label">{item.label}</span>
          <span class="mt-rich-text-editor-blocks-settings-value">{item.value}</span>
        </div>
      {/each}
    </section>
  </div>
</div>

<style>
  .mt-rich-text-editor-blocks-settings {
    padding: 1rem;
  }

  .mt-rich-text-editor-blocks-settings-available,
  .mt-rich-text-editor-blocks-settings-current {
    margin-bottom: 2rem;
  }

  .mt-rich-text-editor-blocks-settings-item {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    cursor: move;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .mt-rich-text-editor-blocks-settings-value {
    color: #666;
    font-size: 0.9em;
  }

  h4 {
    margin: 0 0 1rem;
    font-size: 1rem;
    color: #666;
  }

  .mt-rich-text-editor-blocks-settings-move {
    width: 20px;
    height: 20px;
    padding: 0;
    border: none;
    background: none;
    color: #666;
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: scale(0.75);
  }

  .mt-rich-text-editor-blocks-settings-remove {
    width: 20px;
    height: 20px;
    padding: 0;
    border: none;
    background: none;
    color: #666;
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: scale(0.75);
  }

  .mt-rich-text-editor-blocks-settings-remove:hover {
    color: #c00;
  }

  button:not(.mt-rich-text-editor-blocks-settings-remove) {
    padding: 0.25rem 0.5rem;
    border: 1px solid #ddd;
    background: #f8f8f8;
    border-radius: 3px;
    color: #666;
    cursor: pointer;
    font-size: 0.9em;
  }

  input {
    padding: 0.25rem;
  }

  .mt-rich-text-editor-blocks-settings-available section {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.5rem;
  }

  .mt-rich-text-editor-blocks-settings-label {
    flex: 1;
    font-size: 0.9em;
  }
</style>
