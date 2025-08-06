<script lang="ts">
  const { title }: { title: string } = $props();
  const margin = 10;
  let tooltipEl: HTMLDivElement;
  $effect(() => {
    if (tooltipEl) {
      const rect = tooltipEl.getBoundingClientRect();
      if (rect.x < margin) {
        tooltipEl.style.left = `calc(50% + ${-(rect.x - margin)}px)`;
      } else if (rect.x + rect.width > window.innerWidth - margin) {
        tooltipEl.style.left = `calc(50% - ${rect.x + rect.width - window.innerWidth + margin}px)`;
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
