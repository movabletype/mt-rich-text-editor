<svelte:options
  customElement={{
    extend,
  }}
/>

<script module lang="ts">
  import { extendToolbarItem } from "../svelte";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendToolbarItem(customElementConstructor) {
      onEditorUpdate() {
        this.classList.toggle("is-active", this.editor?.getStructureMode());
      }
    };
</script>

<script lang="ts">
  import { t } from "../../../i18n";
  import { ToolbarItemElement } from "../element";
  import icon from "../../../ui/icon/structure.svg?raw";
  import { tooltip } from "../../../tooltip";
  const element = $host<ToolbarItemElement>();
  element.addEventListener("click", () => {
    const editor = element.editor;
    if (!editor) {
      return;
    }
    editor.setStructureMode(!editor.getStructureMode());
  });
</script>

<button use:tooltip={t("Toggle to HTML structure editing mode")}>
  {@html icon}
</button>
