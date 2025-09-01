<script lang="ts">
  import { WINDOW_EDGE_MARGIN } from "../constant";
  const { title }: { title: string } = $props();
  let tooltipEl: HTMLDivElement;
  $effect(() => {
    if (tooltipEl) {
      const rect = tooltipEl.getBoundingClientRect();
      if (rect.x < WINDOW_EDGE_MARGIN) {
        tooltipEl.style.left = `calc(50% + ${-(rect.x - WINDOW_EDGE_MARGIN)}px)`;
      } else if (rect.x + rect.width > window.innerWidth - WINDOW_EDGE_MARGIN) {
        tooltipEl.style.left = `calc(50% - ${rect.x + rect.width - window.innerWidth + WINDOW_EDGE_MARGIN}px)`;
      }
    }
  });
</script>

<div bind:this={tooltipEl} id="mt-rich-text-editor-tooltip" class="mt-rich-text-editor-tooltip">
  {title}
</div>

<style>
  div {
    position: absolute;
    top: 110%;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    background: black;
    padding: 4px;
    border-radius: 5px;
    width: max-content;
    white-space: nowrap;
    font-size: 90%;
    z-index: 2000;
  }
</style>
