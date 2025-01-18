<svelte:options
  customElement={{
    extend,
  }}
/>

<script module lang="ts">
  import { t } from "../../i18n";
  import { extendPasteMenuItem } from "./svelte";
  import { PasteMenuItemElement } from "./element";
  type EmbedInlineElement = PasteMenuItemElement & {
    inline: string | undefined;
  };
  const extend = (customElementConstructor: typeof HTMLElement): new () => EmbedInlineElement =>
    class extends extendPasteMenuItem(customElementConstructor) {
      public inline: string | undefined = undefined;

      async isEditorItemAvailable() {
        const content = this.content?.plainText || "";
        if (!/^https?:\/\/[^\s]+(\s*)?$/.test(content)) {
          return false;
        }

        const res = await this.tiptap?.commands
          .getEmbedObject({
            url: content,
            maxwidth: 0,
            maxheight: 0,
          })
          .catch(() => ({ html: "", inline: undefined }));

        if (!res?.html) {
          this.editor?.notify({
            level: "error",
            message: t("Failed to get embed object"),
          });
          return false;
        }

        this.inline = res?.inline;
        return !!this.inline;
      }
    };
</script>

<script lang="ts">
  const element = $host<EmbedInlineElement>();
  const apply = () => {
    if (!element.inline) {
      return;
    }

    element.insertPasteContent(element.inline);
  };
  element.onEditorPaste = apply;
  element.addEventListener("click", apply);
</script>

<button>{t("Embed inline")}</button>
