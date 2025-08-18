import { t } from "../../../i18n";
import type { Editor as TiptapEditor } from "@tiptap/core";
import type { Editor } from "../../../editor";
import type { EmbedData } from "./Modal.svelte";

const resolverResponses: Record<
  string,
  Promise<{
    html: string;
    inline?: string;
  }>
> = {};
export const getObject = async ({
  embedData,
  tiptap,
  editor,
}: {
  embedData: EmbedData;
  tiptap?: TiptapEditor;
  editor?: Editor;
}): Promise<{
  html: string;
  inline?: string;
}> => {
  if (!(tiptap && editor)) {
    return {
      html: "",
      inline: undefined,
    };
  }

  return await (resolverResponses[
    `${embedData.url}-${embedData.maxwidth}-${embedData.maxheight}`
  ] ||= tiptap.commands.getEmbedObject(embedData)).catch((e) => {
    editor.notify({
      level: "error",
      message: t("Failed to get embed object: ", e.toString()),
    });
    return {
      html: "",
      inline: undefined,
    };
  });
};
