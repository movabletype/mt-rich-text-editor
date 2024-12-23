<svelte:options customElement="mt-rich-text-editor-toolbar-item-mtimage" />

<script lang="ts">
  import { EditorEventType } from "@movabletype/mt-rich-text-editor";
  import { openDialog } from "../util/dialog";
  import icon from "../asset/image.svg?raw";

  let fieldId: string;
  function openAssetDialog() {
    const blogId = document.querySelector<HTMLInputElement>("[name=blog_id]")?.value || "0";
    const params = new URLSearchParams();
    params.set("__mode", "dialog_asset_modal");
    params.set("_type", "asset");
    params.set("edit_field", fieldId);
    params.set("blog_id", blogId);
    params.set("dialog_view", "1");
    params.set("can_multi", "1");
    params.set("filter", "class");
    params.set("filter_val", "image");
    openDialog(params);
  }

  let containerEl: HTMLElement;
  $effect(() => {
    const rootNode = containerEl?.getRootNode();
    const host = (rootNode as ShadowRoot).host as HTMLElement;
    host.addEventListener(EditorEventType.Init, ({ editor: { id }}) => {
      fieldId = id;
    });
  });
</script>

<div bind:this={containerEl} onclick={openAssetDialog}>
  {@html icon}
</div>
