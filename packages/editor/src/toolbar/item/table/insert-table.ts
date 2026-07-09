import { createTable } from "@tiptap/extension-table";
import { TextSelection } from "@tiptap/pm/state";
import type { Editor as TiptapEditor } from "@tiptap/core";
import { buildMTRichTextEditorHTMLAttributes } from "../../../tiptap/extension/movable-type/global";

const defaultInitialAttributes: Record<string, string> = {
  border: "1",
  style: "border-collapse: collapse; width: 100%;",
};

export const insertTable = (
  tiptap: TiptapEditor,
  rows: number,
  cols: number,
  initialAttributes?: Record<string, string> | null
): void => {
  const { style, ...restAttributes } = initialAttributes ?? defaultInitialAttributes;
  const created = createTable(tiptap.schema, rows, cols, false);
  const table = created.type.create(
    {
      ...created.attrs,
      style,
      MTRichTextEditorHTMLAttributes: buildMTRichTextEditorHTMLAttributes(restAttributes),
    },
    created.content,
    created.marks
  );

  tiptap
    .chain()
    .command(({ tr }) => {
      const offset = tr.selection.from + 1;

      tr.replaceSelectionWith(table)
        .scrollIntoView()
        .setSelection(TextSelection.near(tr.doc.resolve(offset)));

      return true;
    })
    .run();
};
