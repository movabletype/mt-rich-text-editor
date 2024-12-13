import "@movabletype/mt-rich-text-editor/mt-rich-text-editor.css";
import "../css/editor.css";
import { MT } from "@movabletype/app";
import "@movabletype/mt-rich-text-editor/mt-rich-text-editor";
import type { EditorOptions } from "@movabletype/mt-rich-text-editor";
import { Editor } from "@movabletype/mt-rich-text-editor";
import SourceEditor from "./source_editor";
import { currentLanguage } from "./l10n";
import { toggleFullScreen } from "./utils/full_screen";
import fullScreenIcon from "./assets/full_screen.svg?raw";
import { convertToolbar } from "./tinymce";

const MTRichTextEditor = window.MTRichTextEditor;

MTRichTextEditor.setIcons({
  full_screen: fullScreenIcon,
});
MTRichTextEditor.setLanguage(currentLanguage);
MTRichTextEditor.setHandlers({
  full_screen() {
    toggleFullScreen("editor-input-content");
  },
});

const MTEditorClass = MT.Editor!; // MT.Editor is always defined

const createRichTextEditor = async (
  id: string,
  options?: Partial<EditorOptions>
): Promise<Editor> => {
  if (options?.toolbar) {
    options.toolbar = convertToolbar(options.toolbar);
  }
  return MTRichTextEditor.create(
    Object.assign(
      {
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
          ["full_screen"],
        ],
      },
      options
    )
  );
};

class MTRichTextEditorPlugin extends MTEditorClass {
  editor?: Editor | SourceEditor;

  constructor(id: string, manager: unknown, options: Record<string, Record<string, unknown>>) {
    super(id, manager, options);
  }

  async initEditor(this: MTRichTextEditorPlugin, format: string) {
    this.editor = await createRichTextEditor(this.id, this.options?.["richtext"]);
    this.setFormat(format);
  }

  async setFormat(this: MTRichTextEditorPlugin, format: string) {
    const { id, options } = this;
    const mode = MT.EditorManager.toMode(format);
    if (mode === "wysiwyg") {
      if (this.editor instanceof SourceEditor) {
        this.editor.unload();
        this.editor = await createRichTextEditor(id, options?.["richtext"]);
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
