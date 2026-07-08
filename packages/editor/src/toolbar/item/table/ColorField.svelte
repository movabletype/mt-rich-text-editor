<script lang="ts">
  import Panel from "../color/Panel.svelte";
  import { defaultColors } from "../color/constant";

  let {
    id,
    value = $bindable(),
    colors = defaultColors,
  }: {
    id: string;
    value: string;
    colors?: string[];
  } = $props();

  let isOpen = $state(false);

  function handleSelect(color: string) {
    value = color;
    isOpen = false;
  }

  function toggle(ev: MouseEvent) {
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

<button
  type="button"
  {id}
  class="color-swatch"
  style="background-color: {value || 'transparent'}"
  aria-label={value || "none"}
  onclick={toggle}
></button>
<div class="color-panel-container">
  {#if isOpen}
    <Panel {colors} onSelect={handleSelect} />
  {/if}
</div>

<style>
  .color-swatch {
    width: 36px;
    height: 36px;
    padding: 0;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
  }

  .color-panel-container {
    position: relative;
  }
</style>
