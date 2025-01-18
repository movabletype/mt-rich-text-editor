<script lang="ts">
  import type { Editor } from "../editor";
  import Menu from "./Menu.svelte";
  import MenuItemGroup from "./MenuItemGroup.svelte";
  import MenuItem from "./MenuItem.svelte";
  import Edit from "./icon/edit.svg?raw";
  import Unlink from "./icon/unlink.svg?raw";
  import ExternalLink from "./icon/externalLink.svg?raw";
  const { editor, edit } = $props<{
    editor: Editor;
    edit: () => void;
  }>();
  const tiptap = editor.tiptap;

  let linkUrl = $state("");
  tiptap.on("selectionUpdate", () => {
    if (tiptap.isActive("link")) {
      linkUrl = tiptap.getAttributes("link").href;
    }
  });
</script>

<Menu
  {editor}
  targetNodeName="link"
  condition={() => !editor.isPasting() && tiptap.isActive("link")}
>
  {#if linkUrl}
    <MenuItem
      onclick={() => {
        window.open(linkUrl, "_blank");
      }}
    >
      <a class="external-link" href={linkUrl} target="_blank">
        {linkUrl}
        {@html ExternalLink.replace(/width="24"/, "width='16'").replace(
          /height="24"/,
          "height='16'"
        )}
      </a>
    </MenuItem>
  {/if}
  <MenuItemGroup>
    <MenuItem onclick={edit}>
      {@html Edit}
    </MenuItem>
    <MenuItem
      onclick={() => {
        tiptap.chain().focus().unsetLink().run();
      }}
    >
      {@html Unlink}
    </MenuItem>
  </MenuItemGroup>
</Menu>

<style>
  .external-link {
    display: flex;
    align-items: center;
    gap: 4px;
  }
</style>
