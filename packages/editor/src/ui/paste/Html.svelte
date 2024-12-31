<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-paste-menu-item-html",
    extend: extend,
  }}
/>

<script module lang="ts">
  import { extendPasteItem } from "../item/registry/svelte";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendPasteItem(customElementConstructor) {
      isEditorItemAvailable() {
        return !!this.getContent()?.htmlDocument;
      }
    };

  export interface Options {}
</script>

<script lang="ts">
  import { mount, unmount } from "svelte";
  import type { PasteItemProps } from "../item/registry/svelte";
  import { preprocessHTML } from "../../util/html";
  import HtmlModal from "./HtmlModal.svelte";
  const { tiptap, getContent, onApply }: PasteItemProps<Options> = $props();
  let modalComponent: any = null;

  const apply = (htmlDocument: Document | null = null) => {
    const content = getContent();
    if (!content) {
      return;
    }
    if (!tiptap) {
      return;
    }

    htmlDocument ??= content.htmlDocument;

    content.transaction(() => {
      const html = htmlDocument.body.innerHTML ?? "";
      tiptap.chain().undo().focus().run();
      tiptap.commands.insertContent(preprocessHTML(html));
    });

    unmountModal();
  };
  onApply(apply);

  function toggleDetailPanel(ev: MouseEvent) {
    if (!tiptap) {
      return;
    }
    ev.stopPropagation();

    if (!modalComponent) {
      modalComponent = mount(HtmlModal, {
        target: document.body,
        props: {
          htmlDocument: getContent()!.htmlDocument,
          onSubmit: apply,
          onClose: () => {
            unmountModal();
          },
        },
      });
    } else {
      unmountModal();
    }
  }

  function unmountModal() {
    if (modalComponent) {
      unmount(modalComponent);
      modalComponent = null;
    }
  }

  $effect(() => unmountModal);
</script>

<button onclick={toggleDetailPanel}>HTMLとして貼り付け...</button>

<style>
  button {
    background: none;
    border: none;
    margin: 0;
    padding: 0;
    cursor: pointer;
    font-size: inherit;
  }
</style>
