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
  import { findParentNode } from "@tiptap/core";
  import { t } from "../../../i18n";
  import { tooltip } from "../../../ui/tooltip";
  import icon from "../../../ui/icon/edit.svg?raw";
  import type { ToolbarItemElement } from "../element";

  const element = $host<ToolbarItemElement>();
  const { editor, tiptap } = element;

  function getSelectedImageElement(): HTMLElement | null {
    if (!tiptap) {
      return null;
    }
    const { selection } = tiptap.state;
    const targetPos =
      (selection as any).node?.type.name === "image"
        ? selection.$anchor
        : findParentNode((node) => node.type.name === "image")(selection);

    if (!targetPos) return null;

    return tiptap.view.nodeDOM(targetPos.pos) as HTMLElement;
  }

  element.addEventListener("click", () => {
    const el = getSelectedImageElement();
    if (el) {
      editor?.options.toolbarOptions?.image?.edit?.({ editor, element: el });
    }
  });
</script>

<button use:tooltip={t("Edit Image")}>
  {@html icon}
</button>
