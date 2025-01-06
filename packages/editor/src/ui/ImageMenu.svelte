<script lang="ts">
  import type { Editor } from "../editor";
  import Menu from "./Menu.svelte";

  const {
    editor,
  }: {
    editor: Editor;
  } = $props();

  const tiptap = editor.tiptap;
</script>

<Menu {editor} targetNodeName="image" condition={() => tiptap.isActive("image")}>image menu</Menu>
