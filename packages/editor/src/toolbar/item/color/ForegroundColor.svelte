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
  import { defaultColors } from "./constant";
  import type { ToolbarItemElement } from "../element";

  const element = $host<ToolbarItemElement<Options>>();
  element.addEventListener("click", toggleColorPanel);

  const { options, tiptap } = element;
  let isOpen = $state(false);

  const colors = options.presetColors ?? defaultColors;

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
