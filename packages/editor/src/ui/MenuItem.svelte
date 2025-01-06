<script lang="ts">
  import type { Snippet } from "svelte";
  const {
    children,
    onclick,
  }: {
    children: Snippet;
    onclick: () => void;
  } = $props();
</script>

<button type="button" onclick={onclick}>
  {@render children()}
</button>

<style>
  button {
    background: none;
    border: none;
    cursor: pointer;
    display: inline-flex;
    padding-top: 5px;
  }
</style>
