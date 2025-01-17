<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-toolbar-item-structure",
    extend: extendItem,
  }}
/>

<script module lang="ts">
  import type { Editor } from "../../editor";
  import { extend } from "../item/registry/svelte";
  const extendItem = (customElementConstructor: typeof HTMLElement) =>
    class extends extend(customElementConstructor) {
      onEditorUpdate(editor: Editor) {
        this.classList.toggle("is-active", editor.getStructureMode());
      }
    };
</script>

<script lang="ts">
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

<div class="icon" role="button" tabindex="0">
  {@html icon}
</div>

<style>
  .icon {
    width: 24px;
    height: 24px;
  }
</style>
