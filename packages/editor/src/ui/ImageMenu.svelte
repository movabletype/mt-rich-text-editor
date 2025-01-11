<script lang="ts">
  import type { Editor } from "../editor";
  import Menu from "./Menu.svelte";
  import MenuItemGroup from "./MenuItemGroup.svelte";
  import MenuItem from "./MenuItem.svelte";
  import Delete from "./icon/delete.svg?raw";
  import Edit from "./icon/edit.svg?raw";
  import { findParentNode } from "@tiptap/core";

  const {
    editor,
    edit,
  } = $props<{
    editor: Editor;
    edit?: (options: {editor: Editor, element: HTMLElement}) => void;
  }>();

  const tiptap = editor.tiptap;

  function getSelectedImageElement(): HTMLElement | null {
    const { selection } = tiptap.state;
    const targetPos = selection.node?.type.name === "image"
      ? selection.$anchor
      : findParentNode((node) => node.type.name === "image")(selection);
    
    if (!targetPos) return null;
    
    return tiptap.view.nodeDOM(targetPos.pos) as HTMLElement;
  }
</script>

<Menu {editor} targetNodeName="image" condition={() => tiptap.isActive("image")}>
  <MenuItemGroup>
    <MenuItem onclick={() => {
        tiptap.chain().focus().deleteSelection().run();
    }}>
      {@html Delete}
    </MenuItem>
    {#if edit}
    <MenuItem onclick={() => {
        const element = getSelectedImageElement();
        if (element) {
          edit({ editor, element });
        }
      }}>
        {@html Edit}
      </MenuItem>
    {/if}
  </MenuItemGroup>
</Menu>

