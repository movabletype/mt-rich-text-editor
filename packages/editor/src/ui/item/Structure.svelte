<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-toolbar-item-structure",
    extend,
  }}
/>

<script module lang="ts">
  import { extendToolbarItem } from "../item/registry/svelte";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendToolbarItem(customElementConstructor) {
      onEditorUpdate() {
        this.classList.toggle("is-active", this.editor?.getStructureMode());
      }
    };
</script>

<script lang="ts">
  import { t } from "../../i18n";
  import ToolbarButton from "../ToolbarButton.svelte";
  import { ToolbarItemElement } from "../item/element";
  import icon from "../icon/structure.svg?raw";

  const element = $host<ToolbarItemElement>();
  element.addEventListener("click", () => {
    const editor = element.editor;
    if (!editor) {
      return;
    }
    editor.setStructureMode(!editor.getStructureMode());
  });
</script>

<ToolbarButton title={t("Structure editing mode")}>
  {@html icon}
</ToolbarButton>
