import "../../css/editor.css";
import { MT } from "@movabletype/app";
import "@movabletype/mt-rich-text-editor/mt-rich-text-editor";
import type { EditorCreateOptions } from "@movabletype/mt-rich-text-editor";
import { Editor } from "@movabletype/mt-rich-text-editor";
import { currentLanguage } from "../l10n";
import { convertToolbar } from "../util/tinymce";
import editorCss from "../../css/rich-text-editor.css?inline";

import { openDialog } from "../util/dialog";

const MTRichTextEditorManager = window.MTRichTextEditor;

const inlineToolbar: EditorCreateOptions["toolbar"] = [
  [
    [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "bulletList", "orderedList", "horizontalRule"],
      ["link", "unlink"],
    ],
  ],
];

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

let customSettings:
  | ({
      embed_default_params: {
        maxwidth: number;
        maxheight: number;
      };
      toolbar: EditorCreateOptions["toolbar"];
    } & Record<string, unknown>)
  | undefined = undefined;
try {
  customSettings = JSON.parse(
    document.querySelector<HTMLScriptElement>("[data-mt-rich-text-editor-settings]")?.dataset
      .mtRichTextEditorSettings || "{}"
  );
} catch (e) {
  console.error(e);
}

const isMarkdownAvailable =
  document.querySelector<HTMLScriptElement>("[data-mt-rich-text-editor-is-markdown-available]")
    ?.dataset.mtRichTextEditorIsMarkdownAvailable === "1";

const toolbarOptions: Record<string, unknown> = {
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
    edit: ({ editor, element }: { editor: Editor; element: HTMLElement }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window.MT as any).AssetUploader) {
        // new uploader

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const initialSelectedData: any = [];
        const container = element.closest<HTMLElement>("[data-mt-asset-id]");
        const insertOptions = JSON.parse(
          element.closest<HTMLElement>("[data-mt-insert-options]")?.dataset.mtInsertOptions || "{}"
        );
        if (container) {
          initialSelectedData.push({
            id: container.dataset.mtAssetId,
            alternativeText: element.getAttribute("alt") || insertOptions.alternativeText || "",
            caption:
              container
                .querySelector<HTMLElement>("figcaption")
                ?.innerHTML.replace(/<br>/g, "\n")
                .replace(/<[^>]*>/g, "") ||
              insertOptions.caption ||
              "",
            width: parseInt(element.getAttribute("width") || "0") || insertOptions.width || 0,
            linkToOriginal:
              container.tagName === "A" ||
              container.querySelector<HTMLElement>("a") ||
              insertOptions.linkToOriginal ||
              false,
            align: element.className?.match(/mt-image-(\w+)/)?.[1] || insertOptions.align || "none",
          });

          const view = editor.tiptap.view;
          const pos = view.posAtDOM(container, 0);
          if (pos !== undefined) {
            const { state } = view;
            const tr = state.tr.setSelection(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (state.selection.constructor as any).create(state.doc, pos - 1, pos + 1)
            );
            view.dispatch(tr);
          }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window.MT as any).AssetUploader.open({
          selectMetaData: true,
          multiSelect: true,
          params: {},
          initialSelectedData,
          field: editor.id,
        });
      } else {
        // legacy uploader
        const blogId = document.querySelector<HTMLInputElement>("[name=blog_id]")?.value || "0";
        const params = new URLSearchParams();
        params.set("__mode", "dialog_asset_modal");
        params.set("_type", "asset");
        params.set("edit_field", editor.id);
        params.set("blog_id", blogId);
        params.set("dialog_view", "1");
        params.set("can_multi", "1");
        params.set("filter", "class");
        params.set("filter_val", "image");
        openDialog(params);
      }
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
const resolver = async ({
  url,
  maxwidth,
  maxheight,
}: {
  url: string;
  maxwidth?: number;
  maxheight?: number;
}) => {
  const data = await (resolverResponses[`${url}-${maxwidth}-${maxheight}`] ||
    // eslint-disable-next-line no-async-promise-executor
    (resolverResponses[`${url}-${maxwidth}-${maxheight}`] = new Promise(async (resolve) => {
      const blog_id = document.querySelector<HTMLScriptElement>("[data-blog-id]")?.dataset.blogId;
      resolve(
        await (
          await fetch(
            window.CMSScriptURI +
              "?" +
              new URLSearchParams({
                __mode: "mt_rich_text_editor_embed",
                url: url,
                maxwidth: String(
                  (maxwidth || customSettings?.embed_default_params?.maxwidth) ?? ""
                ),
                maxheight: String(
                  (maxheight || customSettings?.embed_default_params?.maxheight) ?? ""
                ),
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
};

MTRichTextEditorManager.on("create", (options) => {
  // for both RichTextEditor and MTBlockEditor
  options.extensionOptions ||= {};
  options.extensionOptions.embedObject ||= {};
  options.extensionOptions.embedObject.resolver ??= resolver;
});

class MTRichTextEditor extends MTEditor {
  editor?: Editor;

  static config: Partial<EditorCreateOptions> = {
    inline: false,
    language: currentLanguage,
    editorStylesheets: [editorCss],
    toolbar: customSettings?.toolbar,
    toolbarOptions,
    extensionOptions: {
      markdown: {
        toHtml: isMarkdownAvailable
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
    if (options.inline) {
      options.toolbar = inlineToolbar;
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

(MTEditor as unknown as { MTRichTextEditor: typeof MTRichTextEditor }).MTRichTextEditor =
  MTRichTextEditor;
MT.EditorManager?.register("mt_rich_text_editor", MTRichTextEditor);
