import type { EditorCreateOptions } from "@movabletype/mt-rich-text-editor";

let customSettings:
  | ({
      embed_default_params: {
        maxwidth: number;
        maxheight: number;
      };
      toolbar: EditorCreateOptions["toolbar"];
    } & Record<string, unknown>)
  | undefined = undefined;
export const getCustomSettings = () => {
  if (!customSettings) {
    try {
      customSettings = JSON.parse(
        document.querySelector<HTMLScriptElement>("[data-mt-rich-text-editor-settings]")?.dataset
          .mtRichTextEditorSettings || "{}"
      );
    } catch (e) {
      console.error(e);
    }
  }
  return customSettings;
};
