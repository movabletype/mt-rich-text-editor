<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-toolbar-item-file",
    extend: extendToolbarItem,
  }}
/>

<script module lang="ts">
  import type { Editor } from "../../editor";
  import { extendToolbarItem } from "../item/registry/svelte";
  export interface Options {
    readonly select?: (options: { editor: Editor }) => void;
  }
</script>

<script lang="ts">
  import { t } from "../../i18n";
  import icon from "../icon/file.svg?raw";
  import ToolbarButton from "../ToolbarButton.svelte";
  import { ToolbarItemElement } from "../item/element";

  const element = $host<ToolbarItemElement<Options>>();
  element.addEventListener("click", () => {
    element.options.select?.({ editor: element.editor! });
  });
</script>

<ToolbarButton title={t("File")}>
  {@html icon}
</ToolbarButton>
