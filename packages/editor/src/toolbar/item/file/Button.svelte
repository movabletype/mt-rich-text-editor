<svelte:options
  customElement={{
    extend: extendToolbarItem,
  }}
/>

<script module lang="ts">
  import type { Editor } from "../../../editor";
  import { extendToolbarItem } from "../svelte";
  export interface Options {
    readonly select?: (options: { editor: Editor }) => void;
  }
</script>

<script lang="ts">
  import { t } from "../../../i18n";
  import { tooltip } from "../../../tooltip";
  import icon from "../../../ui/icon/file.svg?raw";
  import { ToolbarItemElement } from "../element";

  const element = $host<ToolbarItemElement<Options>>();
  element.addEventListener("click", () => {
    element.options.select?.({ editor: element.editor! });
  });
</script>

<button use:tooltip={t("Insert File")}>
  {@html icon}
</button>
