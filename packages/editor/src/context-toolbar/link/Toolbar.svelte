<script lang="ts">
  import type { Editor } from "../../editor";
  import ContextToolbar from "../ContextToolbar.svelte";
  const {
    editor,
  }: {
    editor: Editor;
  } = $props();
  const items = [["previewLink", "editLink", "unlink"]];
</script>

<ContextToolbar
  {editor}
  targetNodeName="link"
  targetNodeTagName="A"
  condition={() => {
    return (
      !editor.isPasting() &&
      editor.tiptap?.isActive("link") &&
      !editor.tiptap?.isActive("link", { class: "mt-asset-link" })
    );
  }}
  {items}
/>
