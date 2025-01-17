<script lang="ts">
  import type { Snippet } from "svelte";
  import { tooltip } from "./tooltip";

  const {
    title,
    disableTooltip,
    children,
  }: {
    title: string;
    disableTooltip?: boolean;
    children: Snippet;
  } = $props();
</script>

<button use:tooltip={title} class:tooltip-disabled={disableTooltip}>
  {@render children()}
</button>

<style>
  button {
    width: 24px;
    height: 24px;
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    position: relative;
  }

  :global(button.tooltip-disabled .mt-rich-text-editor-tooltip) {
    display: none;
  }
</style>
