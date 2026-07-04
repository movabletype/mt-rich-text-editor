import { createTable } from "@tiptap/extension-table";
import { TextSelection } from "@tiptap/pm/state";
import type { Editor as TiptapEditor } from "@tiptap/core";

export const insertTable = (tiptap: TiptapEditor, rows: number, cols: number): void => {
  const created = createTable(tiptap.schema, rows, cols, false);
  const table = created.type.create(
    {
      ...created.attrs,
      style: "border-collapse: collapse; width: 100%;",
      MTRichTextEditorHTMLAttributes: { border: "1" },
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
