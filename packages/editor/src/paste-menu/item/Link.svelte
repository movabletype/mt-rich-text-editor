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
        return /^https?:\/\/[^\s]+(\s*)?$/.test(this.content?.plainText ?? "");
      }
    };
</script>

<script lang="ts">
  import { t } from "../../i18n";
  import { mount, unmount } from "svelte";
  import { PasteMenuItemElement } from "./element";
  import type { LinkData } from "../../ui/link/Modal.svelte";
  import LinkModal from "../../ui/link/Modal.svelte";
  import type { Options } from "../../toolbar/item/link/common";

  const element = $host<PasteMenuItemElement>();

  const { editor, tiptap } = element;
  let modalComponent: ReturnType<typeof mount> | null = null;

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
      target: (editor?.options.toolbarOptions?.link as Options)?.defaultTarget || "_self",
    };

    const anchor = document.createElement("a");
    anchor.href = linkData.url;
    if (linkData.title) {
      anchor.title = linkData.title;
    }
    anchor.target = linkData.target;
    anchor.textContent = linkData.text;

    element.insertContent(anchor.outerHTML);

    unmountModal();
  };
  element.onEditorPaste = apply;

  const toggleDetailPanel = (ev: MouseEvent) => {
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
            target: (editor?.options.toolbarOptions?.link as Options)?.defaultTarget || "_self",
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
  };

  element.addEventListener("click", toggleDetailPanel);

  const unmountModal = () => {
    if (modalComponent) {
      unmount(modalComponent);
      modalComponent = null;
    }
  };

  $effect(() => unmountModal);
</script>

<button>{t("Paste as link")}</button>
