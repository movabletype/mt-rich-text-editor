<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-toolbar-item-boilerplate",
    extend: extend,
  }}
/>

<script module lang="ts">
  import { extend } from "../item/registry/svelte";
  export interface Options {
    readonly boilerplates: {
      title: string;
      url: string;
      description: string;
    }[];
  }
</script>

<script lang="ts">
  import { mount, unmount } from "svelte";
  import icon from "../icon/boilerplate.svg?raw";
  import Modal from "./Modal.svelte";
  import type { Props } from "../item/registry/svelte";

  const { options, tiptap }: Props<Options> = $props();

  function openModal() {
    const modal = mount(Modal, {
      target: document.body,
      props: {
        boilerplates: options.boilerplates,
        onSubmit: (text: string) => {
          tiptap?.chain().focus().insertContent(text).run();
          unmount(modal);
        },
        onClose: () => {
          unmount(modal);
        },
      },
    });
  }
</script>

<div onclick={openModal} class="icon">
  {@html icon}
</div>

<style>
  .icon {
    width: 24px;
    height: 24px;
  }
</style>
