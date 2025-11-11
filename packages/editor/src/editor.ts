import { Editor as TiptapEditor, Extension as TiptapExtension, generateJSON } from "@tiptap/core";
import type { EditorView } from "@tiptap/pm/view";
import { html } from "js-beautify";
import type { HTMLBeautifyOptions } from "js-beautify";
import { Extension } from "./tiptap/extension";
import { Toolbar } from "./toolbar";
import { Statusbar } from "./statusbar";
import { PasteMenu } from "./paste-menu";
import { QuickAction } from "./quick-action";
import { StructureMode } from "./structure-mode";
import { preprocessHTML, normalizeHTML } from "./util/html";
import { insertStylesheets } from "./util/dom";
import prosemirrorCss from "prosemirror-view/style/prosemirror.css?raw";
import editorCss from "./editor.css?inline";
import contentCss from "./content.css?inline";
import { DEFAULT_BLOCK_ELEMENTS, DEFAULT_INLINE_ELEMENTS } from "./constant";

interface HtmlOutputOptions {
  format?: boolean;
  indentSize?: number;
  contentUnformatted?: string[];
}

export interface ExtensionOptions {
  [key: string]: unknown;
  embedObject?: {
    resolver?: (data: { url: string; maxwidth?: number; maxheight?: number }) => Promise<{
      error?: {
        message: string;
      };
      inline?: boolean;
    }>;
  };
  div?: {
    elements?: string[];
  };
  span?: {
    elements?: string[];
  };
  movableType?: {
    additionalGlobalAttributeTypes?: string[];
    tags?: string[];
  };
}

export interface EditorOptions {
  inline?: boolean;
  structure?: boolean;
  height?: number | string;
  classNames?: string[];
  stylesheets?: string[];
  editorStylesheets?: string[];
  /**
   * toolbar definition
   * @example
   * [
   *   // 1st row
   *   [
   *     // left side groups
   *     [
   *       ["bold", "italic", "underline"],
   *       ["orderedList", "bulletList"],
   *     ],
   *     // right side groups
   *     [
   *       ["source"],
   *     ],
   *   ],
   *   // 2nd row
   *   [
   *     // left side groups
   *     [
   *       ["undo", "redo"],
   *     ],
   *     // has no right side groups
   *   ],
   *   // more rows...
   * ]
   */
  toolbar?: string[][][][];
  toolbarContainer?: HTMLDivElement | null;
  toolbarOptions?: Record<string, unknown>;
  /**
   * statusbar definition
   * @example
   * [
   *   // left side items
   *   ["path"],
   *   // right side items
   *   ["wordCount"],
   * ]
   */
  statusbar?: string[][];
  statusbarContainer?: HTMLDivElement | null;
  statusbarOptions?: Record<string, unknown>;
  extensions?: TiptapExtension[];
  extensionOptions?: ExtensionOptions;
  pasteMenu?: string[];
  pasteMenuOptions?: ConstructorParameters<typeof PasteMenu>[0]["options"];
  quickAction?: string[];
  quickActionOptions?: ConstructorParameters<typeof QuickAction>[0]["options"];
  autoFocus?: boolean;
  htmlOutputOptions?: HtmlOutputOptions;
  /**
   * user-defined additional block (div-like) elements
   * @example
   * ["abbr", "address"]
   */
  additionalBlockElements?: string[];
  /**
   * user-defined additional inline elements
   * @example
   * ["time", "var"]
   */
  additionalInlineElements?: string[];
}

const DEFAULT_HEIGHT = 350;
const MIN_HEIGHT = 300;

export const EditorEl = Symbol("EditorEl");

type OnPasteCallback = (view: EditorView, event: ClipboardEvent) => boolean;

export class Editor {
  public id: string;
  public tiptap: TiptapEditor;
  public [EditorEl]: HTMLDivElement;
  public options: EditorOptions;
  #onPasteCallback: OnPasteCallback | undefined;
  #containerEl: HTMLDivElement;
  #textarea: HTMLTextAreaElement;
  #editorContainerEl: HTMLDivElement;
  #toolbar: Toolbar;
  #statusbar: Statusbar;
  #pasteMenu: PasteMenu;
  #quickAction: QuickAction;
  #structureMode: StructureMode | undefined;
  #htmlOutputOptions: HTMLBeautifyOptions | undefined;
  #tiptapExtensions: TiptapExtension[];
  #blockElements: string[];
  #inlineElements: string[];

  constructor(textarea: HTMLTextAreaElement, options: EditorOptions) {
    this.id = textarea.id;
    this.#textarea = textarea;
    this.options = options;
    this.#blockElements = DEFAULT_BLOCK_ELEMENTS.concat(options.additionalBlockElements ?? []);
    this.#inlineElements = DEFAULT_INLINE_ELEMENTS.concat(options.additionalInlineElements ?? []);

    this.#htmlOutputOptions =
      options.htmlOutputOptions?.format === false
        ? undefined
        : {
            indent_size: options.htmlOutputOptions?.indentSize ?? 0,
            wrap_line_length: 0,
            content_unformatted: options.htmlOutputOptions?.contentUnformatted ?? [
              "pre",
              "style",
              "script",
            ],
          };

    const inline = options.inline ?? false;
    const height =
      typeof options.height === "number"
        ? `${options.height}px`
        : (options.height ??
          `${localStorage.getItem("mt-rich-text-editor-height") ?? DEFAULT_HEIGHT}px`);

    this.#containerEl = document.createElement("div");
    this.#containerEl.className = "mt-rich-text-editor";
    if (!inline) {
      this.#containerEl.style.height = height;
    } else {
      this.#containerEl.style.minHeight = height;
    }
    this.#containerEl.dataset.mtRichTextEditorId = textarea.id;
    this.#textarea.parentNode?.insertBefore(this.#containerEl, this.#textarea);
    this.#textarea.style.display = "none";

    const editorShadow = this.#containerEl.attachShadow({ mode: "open" });
    insertStylesheets(editorShadow, [editorCss, ...(options.editorStylesheets ?? [])]);
    this[EditorEl] = document.createElement("div");
    this[EditorEl].classList.add("mt-rich-text-editor-editor");
    if (inline) {
      this[EditorEl].classList.add("mt-rich-text-editor-editor--inline");
      this[EditorEl].style.minHeight = height;
    }
    editorShadow.appendChild(this[EditorEl]);

    const initBarMount = (_container: EditorOptions["toolbarContainer"], className: string) => {
      const container =
        _container ??
        (() => {
          const container = document.createElement("div");
          container.className = className;
          if (inline) {
            container.classList.add(`${className}--inline`);
          }
          this[EditorEl].appendChild(container);
          return container;
        })();
      const shadow = container.attachShadow({ mode: "open" });
      insertStylesheets(shadow, options.editorStylesheets ?? []);
      const mount = document.createElement("div");
      shadow.appendChild(mount);
      return mount;
    };
    const toolbarMount = initBarMount(
      options.toolbarContainer,
      options.toolbar?.length ? "mt-rich-text-editor-toolbar" : "mt-rich-text-editor-toolbar--empty"
    );

    this.#editorContainerEl = document.createElement("div");
    this.#editorContainerEl.className = "mt-rich-text-editor-content";
    const shadow = this.#editorContainerEl.attachShadow({ mode: "open" });
    insertStylesheets(shadow, [
      prosemirrorCss + editorCss + contentCss,
      ...(options.editorStylesheets ?? []),
      ...(options.stylesheets ?? []),
    ]);

    const editorMount = document.createElement("div");
    editorMount.className = "mt-rich-text-editor-content-root";
    shadow.appendChild(editorMount);
    this[EditorEl].appendChild(this.#editorContainerEl);

    const onPaste = (callback: OnPasteCallback): void => {
      this.#onPasteCallback = callback;
    };
    const handlePaste = (...args: Parameters<OnPasteCallback>) => {
      return this.#onPasteCallback?.(...args) ?? false;
    };

    const pasteMenuContainer = document.createElement("div");
    pasteMenuContainer.className = "mt-rich-text-editor-paste-menu";
    shadow.appendChild(pasteMenuContainer);

    const extensionOptions = options.extensionOptions ?? {};
    extensionOptions.div ??= {};
    extensionOptions.div.elements ??= this.#blockElements;
    extensionOptions.span ??= {};
    extensionOptions.span.elements ??= this.#inlineElements;
    this.#tiptapExtensions = [Extension.configure(extensionOptions), ...(options.extensions ?? [])];
    this.tiptap = new TiptapEditor({
      element: editorMount,
      extensions: this.#tiptapExtensions,
      content: preprocessHTML(this.#textarea.value),
      editorProps: {
        handlePaste,
        attributes: {
          class: options.classNames?.join(" ") || "",
        },
      },
    });
    if (options.autoFocus) {
      this.focus();
    }

    this.#toolbar = new Toolbar({
      target: toolbarMount,
      editor: this,
      toolbar: options.toolbar,
      options: options.toolbarOptions ?? {},
      inline: inline && !options.toolbarContainer,
    });

    const statusbarMount = initBarMount(
      options.statusbarContainer,
      options.statusbar?.length
        ? "mt-rich-text-editor-statusbar"
        : "mt-rich-text-editor-statusbar--empty"
    );
    this.#statusbar = new Statusbar({
      target: statusbarMount,
      editor: this,
      statusbar: options.statusbar ?? [],
      options: options.statusbarOptions ?? {},
      inline: inline && !options.statusbarContainer,
    });

    const pasteMenuMount = initBarMount(pasteMenuContainer, "mt-rich-text-editor-paste-menu");
    this.#pasteMenu = new PasteMenu({
      target: pasteMenuMount,
      editor: this,
      onPaste,
      pasteMenu: options.pasteMenu ?? [],
      options: options.pasteMenuOptions ?? {},
      inline,
    });

    const quickActionMount = document.createElement("div");
    shadow.appendChild(quickActionMount);
    this.#quickAction = new QuickAction({
      target: quickActionMount,
      editor: this,
      quickAction: options.quickAction ?? [],
      options: options.quickActionOptions ?? {},
    });

    this.#initResizeHandle(this[EditorEl]);

    if (options.structure) {
      this.setStructureMode(true);
    }
  }

  public save(): void {
    this.#textarea.value = this.getContent();
  }

  public getContent(): string {
    return this.#htmlOutputOptions === undefined
      ? normalizeHTML(this.tiptap.getHTML())
      : html(normalizeHTML(this.tiptap.getHTML()), this.#htmlOutputOptions);
  }

  public setContent(content: string): void {
    this.tiptap.commands.setContent(preprocessHTML(content));
    this.#textarea.value = content;
  }

  public getHeight(): number {
    return this.#containerEl.clientHeight;
  }

  public setHeight(height: number): void {
    if (height === 0) {
      return;
    }
    this.#containerEl.style.height = `${height}px`;
    localStorage.setItem("mt-rich-text-editor-height", height.toString());
  }

  public getStructureMode(): boolean {
    return this.#structureMode !== undefined;
  }

  public setStructureMode(structureMode: boolean): void {
    if (structureMode) {
      this.#structureMode = new StructureMode(this);
    } else {
      this.#structureMode?.destroy();
      this.#structureMode = undefined;
    }
  }

  public focus(): void {
    this.tiptap.commands.focus();
  }

  public destroy(): void {
    this.#onPasteCallback = undefined;
    this.#toolbar.destroy();
    this.#statusbar.destroy();
    this.#pasteMenu.destroy();
    this.#structureMode?.destroy();
    this.#quickAction.destroy();
    this.tiptap.destroy();
    this.#containerEl.remove();
  }

  public insertContent(html: string): void {
    const json = generateJSON(preprocessHTML(html), this.#tiptapExtensions);
    this.tiptap.commands.insertContent(json);
  }

  public notify({ message }: { level: "error" | "warning"; message: string }): void {
    // TODO: Implement different notification methods for different levels
    alert(message);
  }

  public isPasting(): boolean {
    return this.#pasteMenu.isPasting();
  }

  #initResizeHandle(editor: HTMLDivElement): void {
    const resizeHandle = document.createElement("div");
    resizeHandle.className = "mt-rich-text-editor-resize-handle";
    editor.appendChild(resizeHandle);

    let startY = 0;
    let startHeight = 0;

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      startY = e.clientY;
      startHeight = this.getHeight();
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY;
      const newHeight = Math.max(MIN_HEIGHT, startHeight + deltaY);
      this.setHeight(newHeight);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    resizeHandle.addEventListener("mousedown", onMouseDown);
  }
}
