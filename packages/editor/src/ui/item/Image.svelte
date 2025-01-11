<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-toolbar-item-image",
    extend: extend,
  }}
/>

<script module lang="ts">
  import type { Editor } from "../../editor";
  import { extend } from "../item/registry/svelte";
  export interface Options {
    readonly select?: (options: { editor: Editor }) => void;
    readonly edit?: (options: { editor: Editor; element: HTMLElement }) => void;
  }
</script>

<script lang="ts">
  import icon from "../icon/image.svg?raw";
  import type { Props } from "../item/registry/svelte";
  import { ImageMenu } from "../../imageMenu";

  const { editor, options }: Props<Options> = $props();

  let menu: ImageMenu | undefined;
  $effect(() => {
    if (editor) {
      menu = new ImageMenu({ editor, edit: options.edit });
    }
    return () => {
      menu?.destroy();
    };
  });
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
