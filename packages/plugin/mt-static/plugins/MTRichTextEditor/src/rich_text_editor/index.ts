import "../../css/editor.css";
import { MT } from "@movabletype/app";
import "@movabletype/mt-rich-text-editor/mt-rich-text-editor";
import type { EditorOptions } from "@movabletype/mt-rich-text-editor";
import { Editor } from "@movabletype/mt-rich-text-editor";
import { DEFAULT_HEIGHT } from "../constant";
import { currentLanguage } from "../l10n";
import assetIcon from "../assets/asset.svg?raw";
import imageIcon from "../assets/image.svg?raw";
import { convertToolbar } from "../util/tinymce";

import "./button/fullScreen.ts"

const MTRichTextEditorManager = window.MTRichTextEditor;



MTRichTextEditorManager.setIcons({
  full_screen: fullScreenIcon,
  mt_file: assetIcon,
  mt_image: imageIcon,
});
MTRichTextEditorManager.setLanguage(currentLanguage);
MTRichTextEditorManager.setHandlers({
  full_screen() {
    toggleFullScreen("editor-input-content");
  },
  mt_file() {
    const blogId = document.querySelector<HTMLInputElement>("[name=blog_id]")?.value || 0;
    const fieldId = this.quill.container.dataset.id;
    openDialog(
      "dialog_asset_modal",
      `_type=asset&amp;edit_field=${fieldId}&amp;blog_id=${blogId}&amp;dialog_view=1&amp;filter=class&amp;filter_val=image&amp;can_multi=1`
    );
  },
  mt_image() {
    const blogId = document.querySelector<HTMLInputElement>("[name=blog_id]")?.value || 0;
    const fieldId = this.quill.container.dataset.id;
    openDialog(
      "dialog_asset_modal",
      `_type=asset&amp;edit_field=${fieldId}&amp;blog_id=${blogId}&amp;dialog_view=1&amp;can_multi=1`
    );
  },
});

const createRichTextEditor = async (
  id: string,
  options?: Partial<EditorOptions>
): Promise<Editor> => {
  if (options?.modules?.toolbar) {
    options.modules = {
      ...options.modules,
      toolbar: convertToolbar(options.modules.toolbar),
    };
  }

  return MTRichTextEditorManager.create({
    id,
    height: options?.inline ? undefined : DEFAULT_HEIGHT,
    ...MTRichTextEditor.config,
    ...options,
  });
};

class MTRichTextEditor extends (MT.Editor!) {
  editor?: Editor;

  static config: Partial<EditorOptions> = {
    modules: {
      toolbar: [
        [
          ["bold", "italic", "underline", "strike"],
          ["blockquote", { list: "bullet" }, { list: "ordered" }, "hr"],
          ["mt_link", "mt_unlink"],
          ["insert_html", "mt_file", "mt_image"],
          ["mt_table"],
          ["source"],
        ],
        [
          ["undo", "redo"],
          [{ color: [] }, { background: [] }, "clean"],
          [{ align: "" }, { align: "center" }, { align: "right" }],
          [{ indent: "+1" }, { indent: "-1" }],
          [{ block: ["p", "h1", "h2", "h3", "h4", "h5", "h6", "pre"] }],
          ["full_screen"],
        ],
      ],
      uploader: {
        handler(file) {
          const blogId = document.querySelector<HTMLInputElement>("[name=blog_id]")?.value || 0;
          const fieldId = this.quill.container.dataset.id;
          // TODO: upload file
          console.log(file);
          openDialog(
            "dialog_asset_modal",
            `_type=asset&amp;edit_field=${fieldId}&amp;blog_id=${blogId}&amp;dialog_view=1&amp;can_multi=1`
          );
        },
      },
    },
  };

  static formats() {
    return [
      "wysiwyg",
      "blockeditor", // only for fallback, not used
    ];
  }

  get currentEditor() {
    return this.editor;
  }

  async initEditor(format: string, content?: string, height?: number) {
    const options = { ...(this.options?.[format] || {}) };
    if (content !== undefined) {
      options.content = content;
    }
    if (height !== undefined) {
      options.height = height;
    }
    this.editor = await createRichTextEditor(this.id, options);
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

(MT.Editor as any).MTRichTextEditor = MTRichTextEditor;
MT.EditorManager.register("mt_rich_text_editor", MTRichTextEditor);
