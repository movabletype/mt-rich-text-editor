<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-paste-menu-item-link",
    extend,
  }}
/>

<script module lang="ts">
  import { extendPasteMenuItem } from "../item/registry/svelte";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendPasteMenuItem(customElementConstructor) {
      isEditorItemAvailable() {
        return /^https?:\/\/[^\s]+(\s*)?$/.test(this.content?.plainText ?? "");
      }
    };
</script>

<script lang="ts">
  import { t } from "../../i18n";
  import { mount, unmount } from "svelte";
  import { PasteMenuItemElement } from "../item/element";
  import PasteMenuButton from "../PasteMenuButton.svelte";
  import type { LinkData } from "../link/Modal.svelte";
  import LinkModal from "../link/Modal.svelte";

  const element = $host<PasteMenuItemElement>();
  element.addEventListener("click", toggleDetailPanel);

  const { tiptap } = element;
  let modalComponent: any = null;
  
  const apply = (linkData: LinkData | undefined = undefined) => {
    const content = element.content;
    if (!content) {
      return;
    }
    if (!tiptap) {
      return;
    }

    linkData ??= {
      url: content.plainText,
      text: content.plainText,
      title: "",
      target: "_self",
    };

    const anchor = document.createElement("a");
    anchor.href = linkData.url;
    if (linkData.title) {
      anchor.title = linkData.title;
    }
    anchor.target = linkData.target;
    anchor.textContent = linkData.text;

    element.insertPasteContent(anchor.outerHTML);

    unmountModal();
  };
  element.onEditorPaste = apply;

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
            url: element.content!.plainText,
            text: element.content!.plainText,
            title: "",
            target: "_self",
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

<PasteMenuButton>{t("Paste as link")}</PasteMenuButton>
