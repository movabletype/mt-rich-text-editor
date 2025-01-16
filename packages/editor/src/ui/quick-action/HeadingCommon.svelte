<script lang="ts">
  const {
    icon,
    label,
  }: {
    icon: string;
    label: string;
  } = $props();
</script>

<button>
  <span class="icon">{@html icon}</span>
  <span>{label}</span>
</button>

<style>
  button {
    display: flex;
    align-items: center;
    gap: 10px;
    background: none;
    border: none;
    margin: 0;
    padding: 0;
    cursor: pointer;
    font-size: inherit;
  }

  .icon {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 4px;
  }
</style>
