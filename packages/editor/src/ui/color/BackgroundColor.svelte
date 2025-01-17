<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-toolbar-item-backgroundcolor",
    extend: extendToolbarItem,
  }}
/>

<script module lang="ts">
  import { extendToolbarItem } from "../item/registry/svelte";
  export interface Options {
    readonly presetColors?: string[];
  }
</script>

<script lang="ts">
  import { t } from "../../i18n";
  import icon from "../icon/backgroundColor.svg?raw";
  import ToolbarButton from "../ToolbarButton.svelte";
  import Panel from "./Panel.svelte";
  import type { ToolbarItemElement } from "../item/element";

  const element = $host<ToolbarItemElement<Options>>();
  element.addEventListener("click", toggleColorPanel);

  const { options, tiptap } = element;
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
  element.onEditorUpdate = () => {
    selectedColor = tiptap?.getAttributes("textStyle").backgroundColor ?? "#000000";
  };

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

<ToolbarButton title={t("Background Color")} disableTooltip={isOpen}>
  {@html icon.replace(/fill="currentColor"/g, `fill="${selectedColor}"`)}
</ToolbarButton>

<div class="color-panel-container">
  {#if isOpen}
    <Panel {colors} onSelect={handleSelect} />
  {/if}
</div>

<style>
  .color-panel-container {
    position: relative;
  }
</style>
