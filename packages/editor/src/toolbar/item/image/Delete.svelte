<svelte:options
  customElement={{
    extend,
  }}
/>

<script module lang="ts">
  import { extendToolbarItem } from "../svelte";
  // eslint-disable-next-line no-useless-assignment -- extend is read by the <svelte:options customElement={{ extend }}> tag above, which this rule's control-flow analysis does not see
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendToolbarItem(customElementConstructor) {};
</script>

<script lang="ts">
  import { t } from "../../../i18n";
  import { tooltip } from "../../../tooltip";
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
