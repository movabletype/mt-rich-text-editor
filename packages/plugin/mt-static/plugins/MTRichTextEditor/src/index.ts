import "@movabletype/mt-rich-text-editor/dist/style.css";
import "../css/editor.css";
import { MT } from "@movabletype/app";
import "@movabletype/mt-rich-text-editor/mt-rich-text-editor";
import { Editor } from "@movabletype/mt-rich-text-editor";
import SourceEditor from "./source_editor";
import { currentLanguage } from "./l10n";
import { toggleFullScreen } from "./utils/full_screen";
import fullScreenIcon from "./assets/full_screen.svg?raw";

const MTRichTextEditor = window.MTRichTextEditor;

MTRichTextEditor.setIcons({
  full_screen: fullScreenIcon,
});
MTRichTextEditor.setLanguage(currentLanguage);
MTRichTextEditor.setHandlers({
  full_screen() {
    console.log(this);
    toggleFullScreen("editor-input-content");
  },
});

const MTEditorClass = MT.Editor!; // MT.Editor is always defined

const createRichTextEditor = async (id: string): Promise<Editor> => {
  return MTRichTextEditor.create({
    id,
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", { list: "ordered" }, { list: "bullet" }, "hr"],
      ["mt_link", "mt_unlink"],
      ["insert_html"],
      ["source"],
      [],
      ["undo", "redo"],
      [{ color: [] }, { background: [] }, "clean"],
      [{ align: "" }, { align: "center" }, { align: "right" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ header: [] }],
      ["full_screen"]
    ],
  });
};

class MTRichTextEditorPlugin extends MTEditorClass {
  editor?: Editor | SourceEditor;

  constructor(id: string, manager: unknown) {
    super(id, manager);
  }

  async initEditor(this: MTRichTextEditorPlugin, format: string) {
    const { id } = this;
    this.editor = await createRichTextEditor(id);
    this.setFormat(format);
  }

  async setFormat(this: MTRichTextEditorPlugin, format: string) {
    const { id } = this;
    const mode = MT.EditorManager.toMode(format);
    if (mode === "wysiwyg") {
      if (this.editor instanceof SourceEditor) {
        this.editor.unload();
        this.editor = await createRichTextEditor(id);
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
