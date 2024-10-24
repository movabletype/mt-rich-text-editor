import "@movabletype/mt-rich-text-editor/dist/style.css";
import MTBlockEditor from "@movabletype/mt-rich-text-editor";

interface MTRichTextEditor {
  id: string;
  initEditor: (format: unknown) => void;
}

MT.Editor.MTRichTextEditor = function (id: string, manager: unknown) {
  MT.Editor.apply(this, [id, manager]);
};
Object.assign(MT.Editor.MTRichTextEditor, MT.Editor);
Object.assign(MT.Editor.MTRichTextEditor.prototype, MT.Editor.prototype);
Object.assign(MT.Editor.MTRichTextEditor.prototype, {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initEditor: function (this: MTRichTextEditor, _: unknown) {
    MTBlockEditor.create({ id: this.id });
  },
});

MT.EditorManager.register("mt_rich_text_editor", MT.Editor.MTRichTextEditor);
