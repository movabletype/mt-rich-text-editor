<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-toolbar-item-link",
    extend,
  }}
/>

<script module lang="ts">
  import type { LinkData } from "../link/Modal.svelte";
  import { extendToolbarItem } from "../item/registry/svelte";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendToolbarItem(customElementConstructor) {
      onEditorUpdate() {
        this.classList.toggle("is-active", this.tiptap?.isActive("link"));
      }
    };
  export interface Options {}
</script>

<script lang="ts">
  import { t } from "../../i18n";
  import { toKeyboardShortcutLabel } from "../../util/keyboardShortcut";
  import { mount, unmount } from "svelte";
  import ToolbarButton from "../ToolbarButton.svelte";
  import { LinkMenu } from "../../linkMenu";
  import icon from "../icon/link.svg?raw";
  import LinkModal from "../link/Modal.svelte";
  import type { ToolbarItemElement } from "../item/element";
  const element = $host<ToolbarItemElement<Options>>();
  const { editor, tiptap } = element;

  const onClick = () => {
    if (!tiptap) {
      return;
    }
    let linkData: LinkData;
    if (tiptap.isActive("link")) {
      tiptap.chain().extendMarkRange("link").run();

      const linkText = tiptap.state.doc.textBetween(
        tiptap.state.selection.from,
        tiptap.state.selection.to
      );

      const attrs = tiptap.getAttributes("link");
      linkData = {
        url: attrs.href || "",
        text: linkText,
        title: attrs.title || "",
        target: attrs.target || "_self",
      };
    } else {
      linkData = {
        url: "",
        text: tiptap.state.selection.empty
          ? ""
          : tiptap.state.doc.textBetween(tiptap.state.selection.from, tiptap.state.selection.to),
        title: "",
        target: "_self",
      };
    }

    const modal = mount(LinkModal, {
      target: document.body,
      props: {
        linkData,
        onSubmit: (linkData: LinkData) => {
          const chain = tiptap.chain().focus();

          if (tiptap.isActive("link")) {
            chain.extendMarkRange("link");
          }

          chain
            .deleteSelection()
            .insertContent({
              type: "text",
              text: linkData.text,
              marks: [
                {
                  type: "link",
                  attrs: {
                    href: linkData.url,
                    target: linkData.target,
                    title: linkData.title,
                  },
                },
              ],
            })
            .run();
          unmount(modal);
        },
        onClose: () => {
          unmount(modal);
        },
      },
    });
  };

  element.addEventListener("click", onClick);

  let menu: LinkMenu | undefined;
  $effect(() => {
    if (editor) {
      menu = new LinkMenu({ editor, edit: onClick });
      editor.tiptap?.commands.setInlineLinkShortcutHandler(onClick);
    }
    return () => {
      menu?.destroy();
    };
  });
</script>

<ToolbarButton title={`${t("Link")} (${toKeyboardShortcutLabel("cmd+K")})`}>
  {@html icon}
</ToolbarButton>
