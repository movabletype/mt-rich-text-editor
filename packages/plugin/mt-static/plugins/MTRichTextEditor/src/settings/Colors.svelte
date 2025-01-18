<script lang="ts">
  import { dndzone } from "svelte-dnd-action";
  import type {} from "@movabletype/mt-rich-text-editor/mt-rich-text-editor";
  import { flipDurationMs, dropTargetStyle } from "./common";

  const { textarea } = $props<{
    textarea: HTMLTextAreaElement;
  }>();

  type Color = string;
  type ColorInternalItem = { id: string; value: string };

  function convertToItems(data: Color[]): ColorInternalItem[] {
    return data.map((item) => ({
      id: item,
      value: item,
    }));
  }

  function convertToData(items: ColorInternalItem[]): Color[] {
    return items.map((item) => item.value);
  }

  let colorsItems = $state(convertToItems(JSON.parse(textarea.value)));
  let newColor = $state("#000000");

  $effect(() => {
    textarea.value = JSON.stringify(convertToData(colorsItems));
  });

  // Handle DnD events
  function handleDndConsider(e: CustomEvent<{ items: ColorInternalItem[] }>) {
    colorsItems = e.detail.items;
  }

  function handleDndFinalize(e: CustomEvent<{ items: ColorInternalItem[] }>) {
    colorsItems = e.detail.items;
  }

  // Add new color
  function handleAddColor() {
    if (!colorsItems.some((item) => item.value === newColor)) {
      colorsItems = [
        ...colorsItems,
        {
          id: newColor,
          value: newColor,
        },
      ];
    }
  }

  // Remove color
  function handleRemoveColor(id: string) {
    colorsItems = colorsItems.filter((item) => item.id !== id);
  }
</script>

<div class="mt-rich-text-editor-colors-settings">
  <!-- Current colors -->
  <div class="mt-rich-text-editor-colors-settings-current">
    <div
      class="mt-rich-text-editor-colors-settings-dndzone"
      use:dndzone={{ items: colorsItems, flipDurationMs, dropTargetStyle }}
      onconsider={handleDndConsider}
      onfinalize={handleDndFinalize}
    >
      {#each colorsItems as item (item.id)}
        <div class="mt-rich-text-editor-colors-settings-tile">
          <button
            class="mt-rich-text-editor-colors-settings-remove"
            type="button"
            onclick={() => handleRemoveColor(item.id)}
            title={window.trans("Remove")}
            aria-label={window.trans("Remove")}>×</button
          >
          <div class="mt-rich-text-editor-colors-settings-tile-inner">
            <div
              class="mt-rich-text-editor-colors-settings-preview"
              style="background-color: {item.value};"
            ></div>
            <div class="mt-rich-text-editor-colors-settings-info">
              <span class="mt-rich-text-editor-colors-settings-value">{item.value}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Add new color -->
  <div class="mt-rich-text-editor-colors-settings-add">
    <h4>{window.trans("Add New Color")}</h4>
    <div class="mt-rich-text-editor-colors-settings-add-form">
      <input type="color" bind:value={newColor} aria-label={window.trans("Select Color")} />
      <button type="button" onclick={handleAddColor}>
        {window.trans("Add")}
      </button>
    </div>
  </div>
</div>

<style>
  .mt-rich-text-editor-colors-settings {
    padding: 1rem;
  }

  .mt-rich-text-editor-colors-settings-current,
  .mt-rich-text-editor-colors-settings-add {
    margin-bottom: 2rem;
    max-width: 600px;
  }

  .mt-rich-text-editor-colors-settings-current .mt-rich-text-editor-colors-settings-dndzone {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  }

  .mt-rich-text-editor-colors-settings-tile {
    position: relative;
    padding: 0.25rem;
    cursor: move;
  }

  .mt-rich-text-editor-colors-settings-tile-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .mt-rich-text-editor-colors-settings-preview {
    width: 50px;
    height: 50px;
    border: 1px solid #ccc;
    border-radius: 2px;
  }

  .mt-rich-text-editor-colors-settings-info {
    margin-top: 0.125rem;
    text-align: center;
  }

  .mt-rich-text-editor-colors-settings-value {
    color: #666;
    font-size: 0.8em;
  }

  .mt-rich-text-editor-colors-settings-remove {
    position: absolute;
    top: -4px;
    right: calc((100% - 70px) / 2 + 3px);
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

  .mt-rich-text-editor-colors-settings-remove:hover {
    color: #c00;
    border-color: #c00;
  }

  .mt-rich-text-editor-colors-settings-add-form {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  button:not(.mt-rich-text-editor-colors-settings-remove) {
    padding: 0.25rem 0.5rem;
    border: 1px solid #ddd;
    background: #f8f8f8;
    border-radius: 3px;
    color: #666;
    cursor: pointer;
    font-size: 0.9em;
  }

  input[type="color"] {
    width: 40px;
    height: 24px;
    padding: 0;
    border: 1px solid #ddd;
    border-radius: 3px;
  }

  h4 {
    margin: 0 0 1rem;
    font-size: 1rem;
    color: #666;
  }
</style>
