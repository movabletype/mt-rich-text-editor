<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-paste-menu-item-html",
    extend,
  }}
/>

<script module lang="ts">
  import { extendPasteMenuItem } from "../item/registry/svelte";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendPasteMenuItem(customElementConstructor) {
      isEditorItemAvailable() {
        return !!this.content?.htmlDocument;
      }
    };
</script>

<script lang="ts">
  import { t } from "../../i18n";
  import { mount, unmount } from "svelte";
  import { preprocessHTML } from "../../util/html";
  import HtmlModal from "./HtmlModal.svelte";
  import PasteMenuButton from "../PasteMenuButton.svelte";
  import type { PasteMenuItemElement } from "../item/element";

  const element = $host<PasteMenuItemElement>();
  element.addEventListener("click", toggleDetailPanel);

  const { tiptap } = element;

  let modalComponent: any = null;

  const apply = (htmlDocument: Document | null | undefined = null) => {
    if (!tiptap) {
      return;
    }

    htmlDocument ??= element.content?.htmlDocument;
    element.insertPasteContent(preprocessHTML(htmlDocument?.body.innerHTML ?? ""));

    unmountModal();
  };
  element.onEditorPaste = apply;

  function toggleDetailPanel(ev: MouseEvent) {
    if (!tiptap) {
      return;
    }
    ev.stopPropagation();

    if (!modalComponent) {
      modalComponent = mount(HtmlModal, {
        target: document.body,
        props: {
          htmlDocument: element.content!.htmlDocument!,
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

<PasteMenuButton>{`${t("Paste as HTML")}...`}</PasteMenuButton>
