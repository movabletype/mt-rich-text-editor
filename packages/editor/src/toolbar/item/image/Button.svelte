<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-toolbar-item-image",
    extend: extendToolbarItem,
  }}
/>

<script module lang="ts">
  import type { Editor } from "../../../editor";
  import { extendToolbarItem } from "../svelte";
  export interface Options {
    readonly select?: (options: { editor: Editor }) => void;
    readonly edit?: (options: { editor: Editor; element: HTMLElement }) => void;
  }
</script>

<script lang="ts">
  import { t } from "../../../i18n";
  import icon from "../../../ui/icon/image.svg?raw";
  import { tooltip } from "../../../ui/tooltip";
  import { ImageMenu } from "../../../imageMenu";
  import type { ToolbarItemElement } from "../element";

  const element = $host<ToolbarItemElement<Options>>();
  const { editor, options } = element;
  element.addEventListener("click", () => {
    element.options.select?.({ editor: element.editor! });
  });

  let menu: ImageMenu | undefined;
  $effect(() => {
    if (editor) {
      menu = new ImageMenu({ editor, edit: options.edit });
    }
    return () => {
      menu?.destroy();
    };
  });
</script>

<button use:tooltip={t("Insert Image")}>
  {@html icon}
</button>
