<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-paste-menu-item-markdown",
    extend,
  }}
/>

<script module lang="ts">
  import { t } from "../../i18n";
  import { extendPasteItem } from "../item/registry/svelte";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendPasteItem(customElementConstructor) {
      isEditorItemAvailable() {
        return (
          this.tiptap?.commands.isMarkdownConversionAvailable() &&
          (this.getContent()?.plainText ?? "")
            .split("\n")
            .some(
              (line) =>
                line.startsWith("#") ||
                line.startsWith("```") ||
                /^=+$/.test(line) ||
                /^-+$/.test(line)
            ) &&
          (this.getContent()?.htmlDocument ? 1 : 2)
        );
      }
    };

  export interface Options {}
</script>

<script lang="ts">
  import type { PasteItemProps } from "../item/registry/svelte";
  const { tiptap, getContent, onApply, insertPasteContent }: PasteItemProps<Options> = $props();

  onApply(async () => {
    insertPasteContent(
      (
        await tiptap?.commands.markdownToHtml({
          content: getContent()?.plainText ?? "",
        })
      )?.content ?? ""
    );
  });
</script>

<button>{t("Convert from Markdown")}</button>

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
