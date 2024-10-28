import "@movabletype/mt-rich-text-editor/dist/style.css";
import MTBlockEditor, { Editor } from "@movabletype/mt-rich-text-editor";
import SourceEditor from "./source_editor";

class MTRichTextEditor extends MT.Editor {
  constructor(id: string, manager: unknown) {
    super(id, manager);
  }

  async initEditor(this: MTRichTextEditor, format: string) {
    const { id } = this;
    this.editor = await MTBlockEditor.create({ id });
    this.setFormat(format, true);
  }

  async setFormat(this: MTRichTextEditor, format: string, calledInInit: boolean) {
    console.log(format, calledInInit);
    const { id } = this;
    const mode = MT.EditorManager.toMode(format);
    if (mode === "wysiwyg") {
      if (!(this.editor instanceof Editor)) {
        this.editor = await MTBlockEditor.create({ id });
      }
    } else {
      if (this.editor instanceof Editor) {
        await MTBlockEditor.unload({ id });
        this.editor = new SourceEditor( { id });
      }
    }
  }

  getHeight(this: MTRichTextEditor): number {
    console.log("getHeight");
    return 0;
  }

  reload(this: MTRichTextEditor) {
    console.log("reload");
  }
}

MT.EditorManager.register("mt_rich_text_editor", MTRichTextEditor);
