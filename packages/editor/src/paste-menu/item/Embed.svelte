<svelte:options
  customElement={{
    extend,
  }}
/>

<script module lang="ts">
  import { extendPasteMenuItem } from "./svelte";
  import { PasteMenuItemElement } from "./element";
  import { getObject } from "./embed/util";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendPasteMenuItem(customElementConstructor) {
      async isEditorItemAvailable() {
        const content = this.content?.plainText || "";
        if (!/^https?:\/\/[^\s]+(\s*)?$/.test(content)) {
          return false;
        }

        const res = await getObject({
          embedData: {
            url: content,
            maxwidth: 0,
            maxheight: 0,
          },
          tiptap: this.tiptap,
          editor: this.editor,
        });

        if (!res?.html) {
          return false;
        }

        const targetDomNode = this.content?.targetDomNode;
        if (
          targetDomNode instanceof HTMLElement &&
          targetDomNode?.tagName === "P" &&
          targetDomNode.childNodes.length === 0
        ) {
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
  let modalComponent: ReturnType<typeof mount> | null = null;

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

    const res = await getObject({
      embedData,
      tiptap: element.tiptap,
      editor,
    });
    if (!res.html) {
      return;
    }

    // FIXME: more common way to insert embed object
    element.content?.transaction(() => {
      tiptap.chain().undo().focus().run();
      tiptap.commands.insertEmbedObject(res.html);
    });
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
