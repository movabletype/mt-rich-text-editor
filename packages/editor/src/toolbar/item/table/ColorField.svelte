<script lang="ts">
  import { t } from "../../../i18n";
  import { cssColorToHex } from "../../../util/html";
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
    value = cssColorToHex(color) ?? color;
    isOpen = false;
  }

  function toggle(ev: MouseEvent) {
    ev.stopPropagation();
    isOpen = !isOpen;
  }

  function handleClear(ev: MouseEvent) {
    ev.stopPropagation();
    value = "";
    isOpen = false;
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

<div class="color-field-container">
  <div class="form-control color-field-control">
    <button
      type="button"
      {id}
      class="color-field-open"
      aria-label={value || t("None")}
      onclick={toggle}
    >
      <span class="color-field-swatch" style="background-color: {value || 'transparent'}"></span>
      <span class="color-field-value">{value || t("None")}</span>
    </button>
    {#if value}
      <button
        type="button"
        class="color-field-clear"
        aria-label={t("Clear Color")}
        onclick={handleClear}
      >
        <span aria-hidden="true">&times;</span>
      </button>
    {/if}
  </div>
  {#if isOpen}
    <Panel {colors} onSelect={handleSelect} />
  {/if}
</div>

<style>
  .color-field-container {
    position: relative;
  }

  .color-field-control {
    display: flex;
    align-items: stretch;
    width: 100%;
    background-color: #fff;
    padding: 0;
  }

  .color-field-open {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
    background: none;
    border: none;
    padding: 0.375rem 0.25rem 0.375rem 0.75rem;
    text-align: left;
    cursor: pointer;
  }

  .color-field-clear {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: none;
    border: none;
    padding: 0.375rem 0.75rem 0.375rem 0.25rem;
    cursor: pointer;
  }

  .color-field-clear:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .color-field-swatch {
    flex: 0 0 auto;
    width: 18px;
    height: 18px;
    border: 1px solid #ccc;
    border-radius: 2px;
  }

  .color-field-value {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
