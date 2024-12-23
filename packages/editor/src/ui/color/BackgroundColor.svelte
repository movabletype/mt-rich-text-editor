<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-toolbar-item-backgroundcolor",
    extend: extend,
  }}
/>

<script module lang="ts">
  import { extend } from "../item/registry/svelte";
  export interface Options {
    readonly presetColors?: string[];
  }
</script>

<script lang="ts">
  import icon from "../icon/backgroundColor.svg?raw";
  import Panel from "./Panel.svelte";
  import type { Props } from "../item/registry/svelte";

  const { options, tiptap, onUpdate }: Props<Options> = $props();
  let isOpen = $state(false);

  const colors = options.presetColors ?? [
    "#000000",
    "#595959",
    "#999999",
    "#CCCCCC",
    "#FFFFFF",
    "#F06292",
    "#E57373",
    "#BA68C8",
    "#9575CD",
    "#7986CB",
    "#64B5F6",
    "#4FC3F7",
    "#4DD0E1",
    "#4DB6AC",
    "#81C784",
    "#AED581",
    "#FFF176",
    "#FFB74D",
    "#FF8A65",
    "#A1887F",
  ];

  let selectedColor = $state("#000000");

  onUpdate(() => {
    selectedColor = tiptap?.getAttributes("textStyle").backgroundColor ?? "#000000";
  });

  function handleSelect(value: string) {
    tiptap?.chain().focus().setBackgroundColor(value).run();
    isOpen = false;
  }

  function toggleColorPanel(ev: MouseEvent) {
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

<div onclick={toggleColorPanel} class="icon">
  {@html icon.replace(/fill="currentColor"/g, `fill="${selectedColor}"`)}
</div>

<div class="color-panel-container">
  {#if isOpen}
    <Panel {colors} onSelect={handleSelect} />
  {/if}
</div>

<style>
  .icon {
    width: 24px;
    height: 24px;
  }
  .color-panel-container {
    position: relative;
  }
</style>
