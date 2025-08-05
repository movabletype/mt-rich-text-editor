<script lang="ts">
  const { title }: { title: string } = $props();
  let tooltipEl: HTMLDivElement;
  $effect(() => {
    if (tooltipEl) {
      const rect = tooltipEl.getBoundingClientRect();
      if (rect.x < 10) {
        tooltipEl.style.left = `calc(50% + ${-(rect.x - 10)}px)`;
      } else if (rect.x + rect.width > window.innerWidth - 10) {
        tooltipEl.style.left = `calc(50% - ${rect.x + rect.width - window.innerWidth + 10}px)`;
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
    max-width: 200px;
    white-space: nowrap;
    font-size: 90%;
    z-index: 2000;
  }
</style>
