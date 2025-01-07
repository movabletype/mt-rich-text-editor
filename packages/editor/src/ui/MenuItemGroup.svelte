<script lang="ts">
  import type { Snippet } from "svelte";
  const {
    children,
  }: {
    children: Snippet;
  } = $props();
</script>

<div class="menu-item-group">
  {@render children()}
</div>

<style>
  .menu-item-group {
    display: flex;
    flex-direction: row;
  }
</style>
