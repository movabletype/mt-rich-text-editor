<svelte:options
  customElement={{
    extend: extendToolbarItem,
  }}
/>

<script module lang="ts">
  import { extendToolbarItem } from "../svelte";
  export interface Options {
    readonly boilerplates: {
      title: string;
      url: string;
      description: string;
    }[];
  }
</script>

<script lang="ts">
  import { t } from "../../../i18n";
  import { mount, unmount } from "svelte";
  import icon from "../../../ui/icon/boilerplate.svg?raw";
  import { tooltip } from "../../../ui/tooltip";
  import Modal from "./Modal.svelte";
  import type { ToolbarItemElement } from "../element";

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

<button use:tooltip={t("Insert Boilerplate")}>
  {@html icon}
</button>

