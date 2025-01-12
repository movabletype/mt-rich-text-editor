<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-paste-menu-item-embed",
    extend: extend,
  }}
/>

<script module lang="ts">
  import { extendPasteItem } from "../item/registry/svelte";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendPasteItem(customElementConstructor) {
      async isEditorItemAvailable() {
        if (!/^https?:\/\/[^\s]+(\s*)?$/.test(this.getContent()?.plainText ?? "")) {
          return false;
        }

        const targetDomNode = this.getContent()?.targetDomNode;
        if (targetDomNode?.tagName === "P" && targetDomNode.childNodes.length === 0) {
          return 2;
        }
        return 1;
      }
    };

  export interface Options {}
</script>

<script lang="ts">
  import { mount, unmount } from "svelte";
  import type { PasteItemProps } from "../item/registry/svelte";
  import type { EmbedData } from "../embed/Modal.svelte";
  import EmbedModal from "../embed/Modal.svelte";
  const { editor, tiptap, getContent, onApply }: PasteItemProps<Options> = $props();
  let modalComponent: any = null;

  const apply = (embedData: EmbedData | undefined = undefined) => {
    const content = getContent();
    if (!content) {
      return;
    }
    if (!tiptap) {
      return;
    }

    embedData ??= {
      url: getContent()!.plainText,
      maxwidth: 0,
      maxheight: 0,
    };

    content.transaction(async () => {
      const res = await tiptap.commands
        .getEmbedObject(embedData)
        .catch(() => ({ html: "", inline: undefined }));
      if (!res?.html) {
        editor?.notify({ level: "error", message: window.trans("Failed to get embed object") });
        return;
      }

      tiptap.chain().undo().focus().run();
      tiptap.commands.insertEmbedObject(res.html);
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
      modalComponent = mount(EmbedModal, {
        target: document.body,
        props: {
          embedData: {
            url: getContent()!.plainText,
          },
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

<button onclick={toggleDetailPanel}>埋め込みオブジェクト...</button>

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
