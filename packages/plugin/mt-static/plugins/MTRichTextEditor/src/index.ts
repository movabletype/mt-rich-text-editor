import "@movabletype/mt-rich-text-editor/mt-rich-text-editor.css";
import "../css/editor.css";
import { MT } from "@movabletype/app";
import "@movabletype/mt-rich-text-editor/mt-rich-text-editor";
import type { EditorOptions } from "@movabletype/mt-rich-text-editor";
import { Editor } from "@movabletype/mt-rich-text-editor";
import { DEFAULT_HEIGHT } from "./constant";
import SourceEditor from "./source_editor";
import { currentLanguage } from "./l10n";
import { toggleFullScreen } from "./utils/full_screen";
import fullScreenIcon from "./assets/full_screen.svg?raw";
import { convertToolbar } from "./tinymce";

const MTRichTextEditorManager = window.MTRichTextEditor;

MTRichTextEditorManager.setIcons({
  full_screen: fullScreenIcon,
});
MTRichTextEditorManager.setLanguage(currentLanguage);
MTRichTextEditorManager.setHandlers({
  full_screen() {
    toggleFullScreen("editor-input-content");
  },
});

const MTEditorClass = MT.Editor!; // MT.Editor is always defined

const createRichTextEditor = async (
  id: string,
  options?: Partial<EditorOptions>,
  content?: string,
  height?: number
): Promise<Editor> => {
  if (options?.toolbar) {
    options.toolbar = convertToolbar(options.toolbar);
  }
  return MTRichTextEditorManager.create(
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
        content,
        height: height ?? (options?.inline ? undefined : DEFAULT_HEIGHT),
      },
      options
    )
  );
};

class MTRichTextEditor extends MTEditorClass {
  editor?: Editor;

  static formats() {
    return [
      "richtext",
      "blockeditor", // only for fallback, not used
    ];
  }

  async initEditor(format: string, content?: string, height?: number) {
    this.editor = await createRichTextEditor(this.id, this.options?.[format], content, height);
  }

  async initOrShow(format: string, content?: string, height?: number) {
    await this.initEditor(format, content, height);
  }

  setFormat() {}

  async hide() {
    this.editor = undefined;
    await MTRichTextEditorManager.unload({ id: this.id });
  }
}

MT.EditorManager.register("mt_rich_text_editor", MTRichTextEditor);

class MTSourceEditor extends MTEditorClass {
  editor?: SourceEditor;

  static formats() {
    return [
      "source",
      "textarea", // only for fallback, not used
    ];
  }

  async initEditor(format: string) {
    this.editor = new SourceEditor({ id: this.id });
    this.editor.setFormat(format);
  }

  async initOrShow(format: string) {
    await this.initEditor(format);
  }

  hide() {
    this.editor?.unload();
    this.editor = undefined;
  }
}

MT.EditorManager.register("mt_source_editor", MTSourceEditor);
