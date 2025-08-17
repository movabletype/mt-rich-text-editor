<svelte:options
  customElement={{
    extend,
  }}
/>

<script module lang="ts">
  import { extendPasteMenuItem } from "./svelte";
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
  import type { PasteMenuItemElement } from "./element";

  const element = $host<PasteMenuItemElement>();
  element.addEventListener("click", toggleDetailPanel);

  const { tiptap } = element;

  let modalComponent: ReturnType<typeof mount> | null = null;

  const apply = (htmlDocument: Document | null | undefined = null) => {
    if (!tiptap) {
      return;
    }

    htmlDocument ??= element.content?.htmlDocument;
    const html = preprocessHTML(htmlDocument?.body.innerHTML ?? "");

    const event = new ClipboardEvent("paste", {
      clipboardData: new DataTransfer(),
    });

    event.clipboardData?.setData("text/html", html);
    event.clipboardData?.setData("x-mt-rich-text-editor", "1");

    tiptap?.$doc.element.dispatchEvent(event);
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

<button>{`${t("Paste as HTML")}...`}</button>
