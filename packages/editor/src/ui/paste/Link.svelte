<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-paste-menu-item-link",
    extend: extend,
  }}
/>

<script module lang="ts">
  import { extendPasteItem } from "../item/registry/svelte";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendPasteItem(customElementConstructor) {
      mtRichTextEditorIsAvailable() {
        return /^https?:\/\/[^\s]+(\s*)?$/.test(this.getContent()?.plainText ?? "");
      }
    };

  export interface Options {}
</script>

<script lang="ts">
  import { mount, unmount } from "svelte";
  import type { PasteItemProps } from "../item/registry/svelte";
  import type { LinkData } from "../link/Modal.svelte";
  import LinkModal from "../link/Modal.svelte";
  import { preprocessHTML } from "../../util/html";
  const { tiptap, getContent, onApply }: PasteItemProps<Options> = $props();
  let modalComponent: any = null;

  const apply = (linkData: LinkData | undefined = undefined) => {
    const content = getContent();
    if (!content) {
      return;
    }
    if (!tiptap) {
      return;
    }

    linkData ??= {
      url: getContent()!.plainText,
      text: getContent()!.plainText,
      title: "",
      target: "_self",
    };

    content.transaction(() => {
      const html = `<a href="${linkData.url}" target="${linkData.target}">${linkData.text}</a>`;
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
      modalComponent = mount(LinkModal, {
        target: document.body,
        props: {
          linkData: {
            url: getContent()!.plainText,
            text: getContent()!.plainText,
            title: "",
            target: "_self",
          },
          onSubmit: apply,
          onClose: () => {
            unmountModal();
          }
        }
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

<button onclick={toggleDetailPanel}>リンクとして貼り付け...</button>

<style>
  :host {
    display: flex;
    flex-direction: row;
    gap: 10px;
  }
  button {
    background: none;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    text-align: left;
    padding: 4px;
  }
  button:hover {
    background: #f0f0f0;
  }
</style>
