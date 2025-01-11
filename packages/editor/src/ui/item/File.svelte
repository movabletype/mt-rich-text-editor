<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-toolbar-item-file",
    extend: extend,
  }}
/>

<script module lang="ts">
  import type { Editor } from "../../editor";
  import { extend } from "../item/registry/svelte";
  export interface Options {
    readonly select?: (options: { editor: Editor }) => void;
  }
</script>

<script lang="ts">
  import icon from "../icon/file.svg?raw";
  import type { Props } from "../item/registry/svelte";

  const { editor, options }: Props<Options> = $props();
</script>

<div onclick={() => options.select?.({ editor: editor! })} class="icon" role="button" tabindex="0">
  {@html icon}
</div>

<style>
  .icon {
    width: 24px;
    height: 24px;
  }
</style>
