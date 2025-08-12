<svelte:options
  customElement={{
    extend,
  }}
/>

<script module lang="ts">
  import { t } from "../../i18n";
  import { extendPasteMenuItem } from "./svelte";
  import { PasteMenuItemElement } from "./element";
  import { getObject } from "./embed/util";
  const extend = (customElementConstructor: typeof HTMLElement): new () => PasteMenuItemElement =>
    class extends extendPasteMenuItem(customElementConstructor) {
      async isEditorItemAvailable() {
        const content = this.content?.plainText || "";
        if (!/^https?:\/\/[^\s]+(\s*)?$/.test(content)) {
          return false;
        }

        const res = await getObject({
          embedData: {
            url: content,
            maxwidth: 0,
            maxheight: 0,
          },
          tiptap: this.tiptap,
          editor: this.editor,
        });

        return !!res.inline;
      }
    };
</script>

<script lang="ts">
  const element = $host<PasteMenuItemElement>();
  const apply = () => {
    const content = element.content;
    if (!content) {
      return;
    }
    getObject({
      embedData: {
        url: content.plainText,
        maxwidth: 0,
        maxheight: 0,
      },
      tiptap: element.tiptap,
      editor: element.editor,
    }).then((res) => {
      const content = res.inline;
      if (content) {
        element.insertContent(content);
      }
    });
  };
  element.onEditorPaste = apply;
  element.addEventListener("click", apply);
</script>

<button>{t("Embed inline")}</button>
