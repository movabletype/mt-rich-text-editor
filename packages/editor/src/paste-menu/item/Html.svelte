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
        const doc = this.content?.htmlDocument;
        if (!doc) {
          return false;
        }
        const childNodes = doc.body.childNodes;
        if (childNodes.length === 0) {
          return false;
        }

        if (
          childNodes.length === 1 &&
          childNodes[0] instanceof HTMLParagraphElement &&
          childNodes[0].getAttribute("data-pm-slice") &&
          [...childNodes[0].childNodes].every((n) => n instanceof Text)
        ) {
          return false;
        }

        return true;
      }
    };
</script>

<script lang="ts">
  import { t } from "../../i18n";
  import { mount, unmount } from "svelte";
  import HtmlModal from "./HtmlModal.svelte";
  import type { PasteMenuItemElement } from "./element";
  import { INTERNAL_PASTE_CONTENT_TYPE } from ".";

  const element = $host<PasteMenuItemElement>();
  element.addEventListener("click", toggleDetailPanel);

  const { options, tiptap, editor } = element;

  let modalComponent: ReturnType<typeof mount> | null = null;

  const apply = (htmlDocument: Document | null | undefined = null) => {
    if (!tiptap || !editor) {
      return;
    }

    if (!htmlDocument) {
      htmlDocument = element.content?.htmlDocument?.cloneNode(true) as Document | undefined;
      if (htmlDocument && !options.keepDataAttributes) {
        htmlDocument.body.querySelectorAll<HTMLElement>("*").forEach((e) => {
          for (const key in e.dataset) {
            delete e.dataset[key];
          }
        });
      }
    }
    if (htmlDocument) {
      (options.handler as ((doc: Document) => void) | undefined)?.(htmlDocument);
    }
    const html = editor.preprocessHTML(htmlDocument?.body.innerHTML ?? "");

    const event = new ClipboardEvent("paste", {
      clipboardData: new DataTransfer(),
    });

    event.clipboardData?.setData("text/html", html);
    event.clipboardData?.setData(INTERNAL_PASTE_CONTENT_TYPE, "1");

    element.content?.transaction(() => {
      tiptap.chain().undo().focus().run();
      tiptap.view.dom.dispatchEvent(event);
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
      modalComponent = mount(HtmlModal, {
        target: document.body,
        props: {
          keepDataAttributes: !!options.keepDataAttributes,
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
