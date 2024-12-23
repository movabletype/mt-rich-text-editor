<script lang="ts">
  const { colors, onSelect } = $props<{
    colors: string[];
    onSelect: (color: string) => void;
  }>();
</script>

<div class="color-panel">
  {#each colors as color}
    <div
      class="color-item"
      style="background-color: {color}"
      onclick={() => onSelect(color)}
      role="button"
      aria-label={color}
    />
  {/each}
</div>

<style>
  .color-panel {
    position: absolute;
    top: 0;
    left: 0;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 4px;
    padding: 8px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 160px;
    z-index: 1000;
  }

  .color-item {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    cursor: pointer;
    border: 1px solid #ddd;
  }

  .color-item:hover {
    transform: scale(1.1);
    transition: transform 0.2s;
  }
</style>
