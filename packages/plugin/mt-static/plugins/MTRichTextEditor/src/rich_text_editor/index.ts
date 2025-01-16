import "../../css/editor.css";
import { MT } from "@movabletype/app";
import "@movabletype/mt-rich-text-editor/mt-rich-text-editor";
import type { EditorCreateOptions } from "@movabletype/mt-rich-text-editor";
import { Editor } from "@movabletype/mt-rich-text-editor";
import { DEFAULT_HEIGHT } from "../constant";
import { currentLanguage } from "../l10n";
import { convertToolbar } from "../util/tinymce";
import editorCss from "../../css/rich-text-editor.css?inline";

import { openDialog } from "../util/dialog";

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

const hasMarkdownPlugin =
  document.querySelector<HTMLScriptElement>("[data-mt-rich-text-editor-has-markdown-plugin]")
    ?.dataset.mtRichTextEditorHasMarkdownPlugin === "1";

const toolbarOptions: Record<string, any> = {
  image: {
    select: ({ editor: { id } }: { editor: Editor }) => {
      const blogId = document.querySelector<HTMLInputElement>("[name=blog_id]")?.value || "0";
      const params = new URLSearchParams();
      params.set("__mode", "dialog_asset_modal");
      params.set("_type", "asset");
      params.set("edit_field", id);
      params.set("blog_id", blogId);
      params.set("dialog_view", "1");
      params.set("can_multi", "1");
      params.set("filter", "class");
      params.set("filter_val", "image");
      openDialog(params);
    },
    edit: (options: { editor: Editor; element: HTMLElement }) => {
      console.log(options.editor.id, options.element);
    },
  },
  file: {
    select: ({ editor: { id } }: { editor: Editor }) => {
      const blogId = document.querySelector<HTMLInputElement>("[name=blog_id]")?.value || "0";
      const params = new URLSearchParams();
      params.set("__mode", "dialog_asset_modal");
      params.set("_type", "asset");
      params.set("edit_field", id);
      params.set("blog_id", blogId);
      params.set("dialog_view", "1");
      params.set("can_multi", "1");
      openDialog(params);
    },
  },
};
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

const resolverResponses: Record<
  string,
  Promise<{
    error?: {
      message: string;
    };
    inline?: boolean;
  }>
> = {};

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
        ["insertHtml", "file", "image"],
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
    extensionOptions: {
      embedObject: {
        resolver: async ({
          url,
          maxwidth,
          maxheight,
        }: {
          url: string;
          maxwidth?: number;
          maxheight?: number;
        }) => {
          const data = await (resolverResponses[`${url}-${maxwidth}-${maxheight}`] ||
            (resolverResponses[`${url}-${maxwidth}-${maxheight}`] = new Promise(async (resolve) => {
              const blog_id =
                document.querySelector<HTMLScriptElement>("[data-blog-id]")?.dataset.blogId;
              resolve(
                await (
                  await fetch(
                    window.CMSScriptURI +
                      "?" +
                      new URLSearchParams({
                        __mode: "mt_rich_text_editor_embed",
                        url: url,
                        maxwidth: String(maxwidth ?? ""),
                        maxheight: String(maxheight ?? ""),
                        blog_id: String(blog_id),
                      })
                  )
                ).json()
              );
            })));
          if (data.error?.message) {
            throw new Error(data.error.message);
          }
          return data;
        },
      },
      markdown: {
        toHtml: hasMarkdownPlugin
          ? async ({ content }: { content: string }) => {
              const formData = new FormData();
              formData.append("__mode", "convert_to_html");
              formData.append("text", content);
              formData.append("format", "markdown");
              const data = await (
                await fetch(window.CMSScriptURI, {
                  method: "POST",
                  body: formData,
                })
              ).json();
              if (data.error?.message) {
                throw new Error(data.error.message);
              }
              return { content: data.result.text.replace(/\n/g, "") };
            }
          : undefined,
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

(MTEditor as any).MTRichTextEditor = MTRichTextEditor;
MT.EditorManager?.register("mt_rich_text_editor", MTRichTextEditor);
