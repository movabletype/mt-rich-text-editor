<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-paste-menu-item-embedinline",
    extend: extend,
  }}
/>

<script module lang="ts">
  import { extendPasteItem } from "../item/registry/svelte";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendPasteItem(customElementConstructor) {
      async isEditorItemAvailable() {
        const content = this.getContent()?.plainText || "";
        if (!/^https?:\/\/[^\s]+(\s*)?$/.test(content)) {
          return false;
        }

        const res = await this.tiptap?.commands
          .getEmbedObject({
            url: content,
            maxwidth: 0,
            maxheight: 0,
          });

        return !!res?.inline;
      }
    };

  export interface Options {}
</script>

<script lang="ts">
  import type { PasteItemProps } from "../item/registry/svelte";
  const { editor, tiptap, getContent, onApply }: PasteItemProps<Options> = $props();

  const apply = () => {
    const content = getContent();
    if (!content) {
      return;
    }
    if (!tiptap) {
      return;
    }

    content.transaction(async () => {
      const res = await tiptap.commands
        .getEmbedObject({
          url: content.plainText,
          maxwidth: 0,
          maxheight: 0,
        })
        .catch(() => ({ html: "", inline: undefined }));
      if (!res?.html) {
        editor?.notify({ level: "error", message: window.trans("Failed to get embed object") });
        return;
      }

      tiptap.chain().undo().focus().run();
      if (res.inline) {
        tiptap.commands.insertContent(res.inline);
      }
    });
  };
  onApply(apply)
</script>

<button onclick={apply}>インライン埋め込み</button>

<style>
  button {
    background: none;
    border: none;
    margin: 0;
    padding: 0;
    cursor: pointer;
    font-size: inherit;
  }
</style>
