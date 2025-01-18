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
  import icon from "../../../ui/icon/edit.svg?raw";
  import type { ToolbarItemElement } from "../element";
  import { onClickFunction } from "./common";

  const element = $host<ToolbarItemElement>();
  const { tiptap } = element;
  element.addEventListener("click", onClickFunction(tiptap));
</script>

<button use:tooltip={t("Edit Link")}>
  {@html icon}
</button>
