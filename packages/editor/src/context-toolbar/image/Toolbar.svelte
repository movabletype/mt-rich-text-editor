<script lang="ts">
  import type { Editor } from "../../editor";
  import ContextToolbar from "../ContextToolbar.svelte";

  const { editor } = $props<{
    editor: Editor;
  }>();

  // svelte-ignore state_referenced_locally (editor is stable for this component's whole mounted lifetime; one Toolbar per Editor instance)
  const tiptap = editor.tiptap;
  // svelte-ignore state_referenced_locally (editor is stable for this component's whole mounted lifetime; one Toolbar per Editor instance)
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
