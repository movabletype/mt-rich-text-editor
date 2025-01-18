<svelte:options
  customElement={{
    extend,
  }}
/>

<script module lang="ts">
  import { extendToolbarItem } from "../svelte";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendToolbarItem(customElementConstructor) {};
</script>

<script lang="ts">
  import { t } from "../../../i18n";
  import { tooltip } from "../../../ui/tooltip";
  import icon from "../../../ui/icon/delete.svg?raw";
  import type { ToolbarItemElement } from "../element";

  const element = $host<ToolbarItemElement>();
  element.addEventListener("click", () => {
    element.tiptap?.chain().focus().deleteSelection().run();
  });
</script>

<button use:tooltip={t("Delete Image")}>
  {@html icon}
</button>
