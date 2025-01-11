<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-toolbar-item-link",
    extend: extendItem,
  }}
/>

<script module lang="ts">
  import type { LinkData } from "../link/Modal.svelte";
  import type { Editor } from "../../editor";
  import { extend } from "../item/registry/svelte";
  const extendItem = (customElementConstructor: typeof HTMLElement) =>
    class extends extend(customElementConstructor) {
      onEditorUpdate(editor: Editor) {
        this.classList.toggle("is-active", editor?.tiptap.isActive("link"));
      }
    };
  export interface Options {}
</script>

<script lang="ts">
  import { mount, unmount } from "svelte";
  import type { Props } from "../item/registry/svelte";
  import { LinkMenu } from "../../linkMenu";
  import icon from "../icon/link.svg?raw";
  import LinkModal from "../link/Modal.svelte";

  const { editor, tiptap }: Props<Options> = $props();

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

  let menu: LinkMenu | undefined;
  $effect(() => {
    if (editor) {
      menu = new LinkMenu({ editor, edit: onClick });
    }
    return () => {
      menu?.destroy();
    };
  });
</script>

<div onclick={onClick} class="icon" role="button" tabindex="0">
  {@html icon}
</div>

<style>
  .icon {
    width: 24px;
    height: 24px;
  }
</style>
