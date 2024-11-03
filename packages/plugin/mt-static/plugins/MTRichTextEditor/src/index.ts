import "@movabletype/mt-rich-text-editor/dist/style.css";
import "../css/editor.css";
import { MT } from "@movabletype/app";
import MTRichTextEditor, { Editor } from "@movabletype/mt-rich-text-editor";
import SourceEditor from "./source_editor";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Object.assign((window as any).Lexicon, {
  "Insert (s)": "挿入 (s)",
  "Insert": "挿入",
  "Cancel": "キャンセル",
});

const MTEditorClass = MT.Editor!; // MT.Editor is always defined

class MTRichTextEditorPlugin extends MTEditorClass {
  editor?: Editor | SourceEditor;

  constructor(id: string, manager: unknown) {
    super(id, manager);
  }

  async initEditor(this: MTRichTextEditorPlugin, format: string) {
    const { id } = this;
    this.editor = await MTRichTextEditor.create({ id });
    this.setFormat(format);
  }

  async setFormat(this: MTRichTextEditorPlugin, format: string) {
    const { id } = this;
    const mode = MT.EditorManager.toMode(format);
    if (mode === "wysiwyg") {
      if (this.editor instanceof SourceEditor) {
        this.editor.unload();
        this.editor = await MTRichTextEditor.create({ id });
      }
    } else {
      if (this.editor instanceof Editor) {
        await MTRichTextEditor.unload({ id });
        this.editor = new SourceEditor({ id });
      }
      (this.editor as SourceEditor).setFormat(format);
    }
  }

  getHeight(): number {
    console.log("getHeight");
    return 0;
  }

  reload() {
    console.log("reload");
  }

  insertContent(content: string) {
    this.editor?.insertContent(content);
  }
}

MT.EditorManager.register("mt_rich_text_editor", MTRichTextEditorPlugin);
