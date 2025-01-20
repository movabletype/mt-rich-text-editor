<svelte:options
  customElement={{
    extend,
  }}
/>

<script module lang="ts">
  import { extendPasteMenuItem } from "./svelte";
  import { PasteMenuItemElement } from "./element";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendPasteMenuItem(customElementConstructor) {
      async isEditorItemAvailable() {
        if (!/^https?:\/\/[^\s]+(\s*)?$/.test(this.content?.plainText ?? "")) {
          return false;
        }

        const targetDomNode = this.content?.targetDomNode;
        if (targetDomNode?.tagName === "P" && targetDomNode.childNodes.length === 0) {
          return PasteMenuItemElement.Priority.High;
        }
        return PasteMenuItemElement.Priority.Default;
      }
    };
</script>

<script lang="ts">
  import { t } from "../../i18n";
  import { mount, unmount } from "svelte";
  import type { EmbedData } from "./embed/Modal.svelte";
  import EmbedModal from "./embed/Modal.svelte";

  const element = $host<PasteMenuItemElement>();
  element.addEventListener("click", toggleDetailPanel);

  const { editor, tiptap } = element;
  let modalComponent: any = null;

  const apply = async (embedData: EmbedData | undefined = undefined) => {
    const content = element.content;
    if (!content) {
      return;
    }
    if (!tiptap) {
      return;
    }

    embedData ??= {
      url: content.plainText,
      maxwidth: 0,
      maxheight: 0,
    };

    const res = await tiptap.commands
      .getEmbedObject(embedData)
      .catch(() => ({ html: "", inline: undefined }));
    if (!res?.html) {
      editor?.notify({ level: "error", message: t("Failed to get embed object") });
      return;
    }

    // FIXME: more common way to insert embed object
    tiptap.chain().undo().focus().run();
    tiptap.commands.insertEmbedObject(res.html);
    element.parentElement?.dispatchEvent(new Event("paste-menu-item-applied"));

    unmountModal();
  };
  element.onEditorPaste = apply;

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
            url: element.content!.plainText,
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

<button>
  {t("Embed object")}
</button>
