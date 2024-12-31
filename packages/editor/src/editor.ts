import { Editor as TiptapEditor, Extension as TiptapExtension, generateJSON } from "@tiptap/core";
import type { EditorView } from "@tiptap/pm/view";
import { Extension } from "./tiptap/extension";
import { Toolbar } from "./toolbar";
import { Statusbar } from "./statusbar";
import { PasteMenu } from "./pasteMenu";
import { preprocessHTML, normalizeHTML } from "./util/html";
import { insertStylesheets } from "./util/dom";
import prosemirrorCss from "prosemirror-view/style/prosemirror.css?raw";
import editorCss from "./editor.css?inline";
import contentCss from "./content.css?inline";

export interface EditorOptions {
  inline: boolean;
  height?: number;
  stylesheets?: string[];
  editorStylesheets?: string[];
  toolbar: string[][][];
  toolbarContainer?: HTMLDivElement;
  toolbarOptions?: Record<string, any>;
  statusbar?: string[];
  statusbarContainer?: HTMLDivElement;
  statusbarOptions?: Record<string, any>;
  extensions?: TiptapExtension[];
  extensionOptions?: Record<string, any>;
  pasteMenu?: string[];
  pasteMenuOptions?: Record<string, any>;
}

const DEFAULT_HEIGHT = 350;
const MIN_HEIGHT = 300;

export const EditorEl = Symbol("EditorEl");

type OnPasteCallback = (view: EditorView, event: ClipboardEvent) => boolean;

export class Editor {
  public id: string;
  public tiptap: TiptapEditor;
  public [EditorEl]: HTMLDivElement;
  #onPasteCallback: OnPasteCallback | undefined;
  #containerEl: HTMLDivElement;
  #textarea: HTMLTextAreaElement;
  #editorContainerEl: HTMLDivElement;
  #toolbar: Toolbar;
  #statusbar: Statusbar;
  #pasteMenu: PasteMenu;

  constructor(textarea: HTMLTextAreaElement, options: EditorOptions) {
    this.id = textarea.id;
    this.#textarea = textarea;

    const inline = options.inline ?? false;

    this.#containerEl = document.createElement("div");
    this.#containerEl.className = "mt-rich-text-editor";
    this.#containerEl.style.height = `${options.height ?? DEFAULT_HEIGHT}px`;
    this.#containerEl.dataset.mtRichTextEditorId = textarea.id;
    this.#textarea.parentNode?.insertBefore(this.#containerEl, this.#textarea);
    this.#textarea.style.display = "none";

    const editorShadow = this.#containerEl.attachShadow({ mode: "open" });
    insertStylesheets(editorShadow, [editorCss, ...(options.editorStylesheets ?? [])]);
    this[EditorEl] = document.createElement("div");
    this[EditorEl].classList.add("mt-rich-text-editor-editor");
    if (inline) {
      this[EditorEl].classList.add("mt-rich-text-editor-editor--inline");
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
    const toolbarMount = initBarMount(options.toolbarContainer, "mt-rich-text-editor-toolbar");

    this.#editorContainerEl = document.createElement("div");
    this.#editorContainerEl.className = "mt-rich-text-editor-content";
    const shadow = this.#editorContainerEl.attachShadow({ mode: "open" });
    insertStylesheets(shadow, [
      prosemirrorCss + editorCss + contentCss,
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

    this.tiptap = new TiptapEditor({
      element: editorMount,
      extensions: [Extension.configure(options.extensionOptions), ...(options.extensions ?? [])],
      content: preprocessHTML(this.#textarea.value),
      editorProps: {
        handlePaste,
      },
    });

    this.#toolbar = new Toolbar({
      target: toolbarMount,
      editor: this,
      toolbar: options.toolbar,
      options: options.toolbarOptions ?? {},
      inline: inline && !options.toolbarContainer,
    });

    const statusbarMount = initBarMount(
      options.statusbarContainer,
      "mt-rich-text-editor-statusbar"
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

    this.initResizeHandle(this[EditorEl]);
  }

  public save(): void {
    this.#textarea.value = this.getContent();
  }

  public getContent(): string {
    return normalizeHTML(this.tiptap.getHTML());
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
  }

  public focus(): void {
    this.tiptap.commands.focus();
  }

  public destroy(): void {
    this.#onPasteCallback = undefined;
    this.#toolbar.destroy();
    this.#statusbar.destroy();
    this.#pasteMenu.destroy();
    this.tiptap.destroy();
    this.#containerEl.remove();
  }

  public insertContent(html: string): void {
    const json = generateJSON(preprocessHTML(html), this.tiptap.extensionManager.extensions);
    this.tiptap.commands.insertContent(json);
  }

  private initResizeHandle(editor: HTMLDivElement): void {
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
