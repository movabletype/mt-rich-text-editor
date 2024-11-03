<script lang="ts">
  import linkIcon from "../assets/link.svg?raw";
  import assetIcon from "../assets/asset.svg?raw";
  import imageIcon from "../assets/image.svg?raw";
  import fullScreenIcon from "../assets/full_screen.svg?raw";

  const {
    command,
    toggleFullScreen,
    openFileDialog,
    openImageDialog,
    openLinkDialog,
  }: {
    command: any;
    toggleFullScreen: () => void;
    openFileDialog: () => void;
    openImageDialog: () => void;
    openLinkDialog: () => void;
  } = $props();
</script>

<div class="mt-rich-text-editor-source-editor-toolbar">
  <div class="mt-rich-text-editor-source-editor-toolbar-group">
    <button type="button" onclick={() => command.execCommand("bold")}>strong</button>
    <button type="button" onclick={() => command.execCommand("italic")}>em</button>
    <button type="button" onclick={() => command.execCommand("blockquote")}>blockquote</button>
    <button type="button" onclick={() => command.execCommand("insertUnorderedList")}>ul</button>
    <button type="button" onclick={() => command.execCommand("insertOrderedList")}>ol</button>
    {#if command.isSupported("insertListItem")}
      <button type="button" onclick={() => command.execCommand("insertListItem")}>li</button>
    {/if}
  </div>
  <div class="mt-rich-text-editor-source-editor-toolbar-group">
    <button type="button" onclick={openLinkDialog} title="link">
      {@html linkIcon}
    </button>
    <button type="button" onclick={openFileDialog} title="asset">
      {@html assetIcon}
    </button>
    <button type="button" onclick={openImageDialog} title="image">
      {@html imageIcon}
    </button>
  </div>
  <div class="mt-rich-text-editor-source-editor-toolbar-group">
    <button type="button" onclick={toggleFullScreen} title="fullscreen">
      {@html fullScreenIcon}
    </button>
  </div>
</div>

<style>
  .mt-rich-text-editor-source-editor-toolbar {
    display: flex;
    border: 1px solid #ccc;
    border-bottom: none;
    flex-wrap: wrap;
    background-image: url("../assets/toolbar-border.svg");
  }
  .mt-rich-text-editor-source-editor-toolbar-group:not(:last-child) {
    padding: 0 4px;
    border-right: 1px solid #ccc;
    white-space: nowrap;
  }
  button {
    margin: 2px 0 3px;
    height: 34px;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 4px;
  }
  button:hover {
    background: #dee0e2;
  }
</style>
