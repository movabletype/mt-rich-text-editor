<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-paste-menu-item-markdown",
    extend,
  }}
/>

<script module lang="ts">
  import { extendPasteMenuItem } from "../item/registry/svelte";
  import { PasteMenuItemElement } from "../item/element";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendPasteMenuItem(customElementConstructor) {
      isEditorItemAvailable() {
        return this.tiptap?.commands.isMarkdownConversionAvailable() &&
          (this.content?.plainText ?? "")
            .split("\n")
            .some(
              (line) =>
                line.startsWith("#") ||
                line.startsWith("```") ||
                /^=+$/.test(line) ||
                /^-+$/.test(line)
            )
          ? this.content?.htmlDocument
            ? PasteMenuItemElement.Priority.Default
            : PasteMenuItemElement.Priority.High
          : false;
      }
    };

  export interface Options {}
</script>

<script lang="ts">
  import { t } from "../../i18n";
  import PasteMenuButton from "../PasteMenuButton.svelte";
  const element = $host<PasteMenuItemElement>();

  element.onEditorPaste = async () => {
    element.insertPasteContent(
      (
        await element.tiptap?.commands.markdownToHtml({
          content: element.content?.plainText ?? "",
        })
      )?.content ?? ""
    );
  };
</script>

<PasteMenuButton>
  {t("Convert from Markdown")}
</PasteMenuButton>
