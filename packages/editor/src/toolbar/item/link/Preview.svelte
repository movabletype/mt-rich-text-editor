<svelte:options
  customElement={{
    extend,
  }}
/>

<script module lang="ts">
  import { extendToolbarItem } from "../svelte";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendToolbarItem(customElementConstructor) {};
</script>

<script lang="ts">
  import icon from "../../../ui/icon/externalLink.svg?raw";
  import type { ToolbarItemElement } from "../element";

  const element = $host<ToolbarItemElement>();
  const { tiptap } = element;
  let url = $state("");
  element.onEditorUpdate = () => {
    url = tiptap?.getAttributes("link").href;
  };
</script>

<a href={url} target="_blank">
  {url}
  {@html icon}
</a>

<style>
  a {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 100%;
    padding: 0 4px;
  }

  a:hover {
    background-color: #dee0e2;
  }

  a :global(svg) {
    width: 16px;
    height: 16px;
  }
</style>
