import "@movabletype/mt-rich-text-editor/dist/style.css"
import { create } from "@movabletype/mt-rich-text-editor"

MT.Editor.MTRichTextEditor = function () {
  MT.Editor.apply(this, arguments)
}
Object.assign(MT.Editor.MTRichTextEditor, MT.Editor);
Object.assign(MT.Editor.MTRichTextEditor.prototype, MT.Editor.prototype);
Object.assign(MT.Editor.MTRichTextEditor.prototype, {
  initEditor: function (format) {
    create('#' + this.id)
  }
})

MT.EditorManager.register('mt_rich_text_editor', MT.Editor.MTRichTextEditor)
