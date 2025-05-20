<script lang="ts">
  import type { Editor } from "../../editor";
  import ContextToolbar from "../ContextToolbar.svelte";

  const { editor } = $props<{
    editor: Editor;
  }>();

  const tiptap = editor.tiptap;
  const items = editor.options.toolbarOptions?.image?.edit
    ? [["deleteImage"], ["editImage"]]
    : [["deleteImage"]];
</script>

<ContextToolbar
  {editor}
  targetNodeName="image"
  targetNodeTagName="IMG"
  condition={() =>
    !(tiptap.isActive("link") && !tiptap.isActive("link", { class: "mt-asset-link" })) &&
    tiptap.isActive("image")}
  {items}
/>
