<svelte:options
  customElement={{
    extend,
  }}
/>

<script module lang="ts">
  import { extendPasteMenuItem } from "./svelte";
  import { PasteMenuItemElement } from "./element";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendPasteMenuItem(customElementConstructor) {
      isEditorItemAvailable() {
        return this.tiptap?.commands.isMarkdownConversionAvailable() &&
          /^(#|```|- |\* |\d+\. |> |=+$|-+$)/m.test(this.content?.plainText ?? "")
          ? this.content?.htmlDocument
            ? PasteMenuItemElement.Priority.Default
            : PasteMenuItemElement.Priority.High
          : false;
      }
    };
</script>

<script lang="ts">
  import { t } from "../../i18n";
  const element = $host<PasteMenuItemElement>();

  const apply = async () => {
    element.insertContent(
      (
        await element.tiptap?.commands.markdownToHtml({
          content: element.content?.plainText ?? "",
        })
      )?.content ?? ""
    );
  };
  element.onEditorPaste = apply;
  element.addEventListener("click", apply);
</script>

<button>
  {t("Convert from Markdown")}
</button>
