<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-toolbar-item-boilerplate",
    extend: extendToolbarItem,
  }}
/>

<script module lang="ts">
  import { extendToolbarItem } from "../item/registry/svelte";
  export interface Options {
    readonly boilerplates: {
      title: string;
      url: string;
      description: string;
    }[];
  }
</script>

<script lang="ts">
  import { t } from "../../i18n";
  import { mount, unmount } from "svelte";
  import ToolbarButton from "../ToolbarButton.svelte";
  import icon from "../icon/boilerplate.svg?raw";
  import Modal from "./Modal.svelte";
  import type { ToolbarItemElement } from "../item/element";

  const element = $host<ToolbarItemElement<Options>>();
  element.addEventListener("click", () => {
    const modal = mount(Modal, {
      target: document.body,
      props: {
        boilerplates: element.options.boilerplates,
        onSubmit: (text: string) => {
          element.tiptap?.chain().focus().insertContent(text).run();
          unmount(modal);
        },
        onClose: () => {
          unmount(modal);
        },
      },
    });
  });
</script>

<ToolbarButton title={t("Boilerplate")}>
  {@html icon}
</ToolbarButton>
