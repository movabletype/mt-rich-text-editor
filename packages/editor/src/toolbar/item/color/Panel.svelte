<script lang="ts">
  const { colors, onSelect } = $props<{
    colors: string[];
    onSelect: (color: string) => void;
  }>();

  function handleKeyDown(ev: KeyboardEvent, color: string) {
    if (ev.key === "Enter") {
      ev.stopPropagation();
      onSelect(color);
    }
  }
</script>

<div class="color-panel">
  {#each colors as color}
    <div
      class="color-item"
      style="background-color: {color}"
      onclick={(ev) => {
        ev.stopPropagation();
        onSelect(color);
      }}
      onkeydown={(ev) => handleKeyDown(ev, color)}
      role="button"
      tabindex="0"
      aria-label={color}
    ></div>
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
