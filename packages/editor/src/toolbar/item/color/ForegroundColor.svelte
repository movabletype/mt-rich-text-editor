<svelte:options
  customElement={{
    extend: extendToolbarItem,
  }}
/>

<script module lang="ts">
  import { extendToolbarItem } from "../svelte";
  export interface Options {
    readonly presetColors?: string[];
  }
</script>

<script lang="ts">
  import { t } from "../../../i18n";
  import { tooltip } from "../../../tooltip";
  import icon from "../../../ui/icon/foregroundColor.svg?raw";
  import Panel from "./Panel.svelte";
  import type { ToolbarItemElement } from "../element";

  const element = $host<ToolbarItemElement<Options>>();
  element.addEventListener("click", toggleColorPanel);

  const { options, tiptap } = element;
  let isOpen = $state(false);

  const colors = options.presetColors ?? [
    "#000000",
    "#002B76",
    "#1B4F2A",
    "#783F04",
    "#700000",
    "#351C75",
    "#6B6B6B",
    "#1155CC",
    "#38761D",
    "#B45F06",
    "#AC0000",
    "#674EA7",
    "#999999",
    "#4A86E8",
    "#6AA84F",
    "#E69138",
    "#DC3D3D",
    "#8E7CC3",
    "#D9D9D9",
    "#A4C2F4",
    "#B6D7A8",
    "#F9CB9C",
    "#EA9999",
    "#B4A7D6",
    "#F3F3F3",
    "#CFE2F3",
    "#D9EAD3",
    "#FFE6C4",
    "#F4CCCC",
    "#D9D2E9",
    "#FFFFFF",
    "#EAF1FB",
    "#EBF5EB",
    "#FFF8E1",
    "#FDEBEE",
    "#F2EFF9",
  ];

  let selectedColor = $state("#000000");
  element.onEditorUpdate = () => {
    selectedColor = tiptap?.getAttributes("textStyle").color ?? "#000000";
  };

  function handleSelect(value: string) {
    selectedColor = value;
    tiptap?.chain().focus().setColor(value).run();
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

<button use:tooltip={t("Text Color")} class:tooltip-disabled={isOpen}>
  {@html icon.replace(/fill="currentColor"/g, `fill="${selectedColor}"`)}
</button>

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
