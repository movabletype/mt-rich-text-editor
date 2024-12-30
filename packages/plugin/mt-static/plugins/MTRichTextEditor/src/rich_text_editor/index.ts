import "../../css/editor.css";
import { MT } from "@movabletype/app";
import "@movabletype/mt-rich-text-editor/mt-rich-text-editor";
import type { EditorCreateOptions } from "@movabletype/mt-rich-text-editor";
import { Editor } from "@movabletype/mt-rich-text-editor";
import { DEFAULT_HEIGHT } from "../constant";
import { currentLanguage } from "../l10n";
import { convertToolbar } from "../util/tinymce";
import editorCss from "../../css/rich-text-editor.css?inline";

import "./File.svelte";
import "./Image.svelte";

const MTRichTextEditorManager = window.MTRichTextEditor;

const createRichTextEditor = async (
  id: string,
  options?: Partial<EditorCreateOptions>
): Promise<Editor> => {
  if (options?.toolbar) {
    options.toolbar = convertToolbar(options.toolbar);
  }

  if (document.readyState === "loading") {
    await new Promise<void>((resolve) => {
      document.addEventListener("DOMContentLoaded", () => resolve(), { once: true });
    });
  }

  return MTRichTextEditorManager.create({
    id,
    ...MTRichTextEditor.config,
    ...options,
  } as EditorCreateOptions);
};

let customSettings: Record<string, any> | undefined = undefined;
try {
  customSettings = JSON.parse(
    document.querySelector<HTMLScriptElement>("[data-mt-rich-text-editor-settings]")?.dataset
      .mtRichTextEditorSettings || "{}"
  );
} catch (e) {
  console.error(e);
}

const toolbarOptions: Record<string, any> = {};
if (customSettings?.blocks) {
  toolbarOptions.block = {
    blocks: customSettings.blocks,
  };
}

if (customSettings?.colors) {
  toolbarOptions.foregroundColor = {
    presetColors: customSettings.colors,
  };
  toolbarOptions.backgroundColor = {
    presetColors: customSettings.colors,
  };
}

const MTEditor = MT.Editor || (class {} as NonNullable<typeof MT.Editor>);

class MTRichTextEditor extends MTEditor {
  editor?: Editor;

  static config: Partial<EditorCreateOptions> = {
    height: DEFAULT_HEIGHT,
    inline: false,
    language: currentLanguage,
    editorStylesheets: [editorCss],
    toolbar: customSettings?.toolbar || [
      [
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "bulletList", "orderedList", "horizontalRule"],
        ["link", "unlink"],
        ["insertHtml", "mtFile", "mtImage"],
        ["table"],
        ["source"],
      ],
      [
        ["undo", "redo"],
        ["foregroundColor", "backgroundColor", "removeFormat"],
        ["alignLeft", "alignCenter", "alignRight"],
        ["indent", "outdent"],
        ["block"],
        ["fullScreen"],
      ],
    ],
    toolbarOptions,
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

(MTEditor as any).MTRichTextEditor = MTRichTextEditor;
MT.EditorManager?.register("mt_rich_text_editor", MTRichTextEditor);
