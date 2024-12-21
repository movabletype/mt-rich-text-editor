import { Editor as TiptapEditor, Extension as TiptapExtension } from "@tiptap/core";
import { Extension } from "./tiptap/extension";
import { Toolbar } from "./toolbar";
import { Statusbar } from "./statusbar";
import { preprocessHTML, normalizeHTML } from "./util/html";
import { insertStylesheets } from "./util/dom";
import prosemirrorCss from "prosemirror-view/style/prosemirror.css?raw";
import editorCss from "./editor.css?raw";
import contentCss from "./content.css?raw";

export interface EditorOptions {
  inline: boolean;
  stylesheets?: string[];
  editorStylesheets?: string[];
  toolbar: string[][][];
  toolbarContainer?: HTMLDivElement;
  toolbarOptions?: Record<string, any>;
  statusbar?: string[][][];
  statusbarContainer?: HTMLDivElement;
  statusbarOptions?: Record<string, any>;
  extensions?: TiptapExtension[];
  extensionOptions?: Record<string, any>;
}

const DEFAULT_HEIGHT = 350;
const MIN_HEIGHT = 100;

export class Editor {
  private textarea: HTMLTextAreaElement;
  public editor: TiptapEditor;
  private wrapper: HTMLDivElement;
  private editorContainer: HTMLDivElement;
  private toolbar: Toolbar;
  private statusbar: Statusbar;

  constructor(textarea: HTMLTextAreaElement, options: EditorOptions) {
    this.textarea = textarea;

    this.wrapper = document.createElement("div");
    this.wrapper.className = "mt-rich-text-editor";
    this.wrapper.style.height = `${DEFAULT_HEIGHT}px`;
    this.wrapper.dataset.mtRichTextEditorId = textarea.id;
    this.textarea.parentNode?.insertBefore(this.wrapper, this.textarea);
    this.textarea.style.display = "none";

    const editorShadow = this.wrapper.attachShadow({ mode: "open" });
    insertStylesheets(editorShadow, [editorCss, ...(options.editorStylesheets ?? [])]);
    const editor = document.createElement("div");
    editor.className = "mt-rich-text-editor-editor";
    editorShadow.appendChild(editor);

    const initBarMount = (_container: EditorOptions["toolbarContainer"], className: string) => {
      const container =
        _container ??
        (() => {
          const container = document.createElement("div");
          container.className = className;
          return container;
        })();
      editor.appendChild(container);
      const shadow = container.attachShadow({ mode: "open" });
      insertStylesheets(shadow, options.editorStylesheets ?? []);
      const mount = document.createElement("div");
      shadow.appendChild(mount);
      return mount;
    };
    const toolbarMount = initBarMount(options.toolbarContainer, "mt-rich-text-editor-toolbar");

    this.editorContainer = document.createElement("div");
    this.editorContainer.className = "mt-rich-text-editor-content";
    const shadow = this.editorContainer.attachShadow({ mode: "open" });
    insertStylesheets(shadow, [
      prosemirrorCss + editorCss + contentCss,
      ...(options.stylesheets ?? []),
    ]);

    const editorMount = document.createElement("div");
    editorMount.className = "mt-rich-text-editor-content-root";
    shadow.appendChild(editorMount);
    editor.appendChild(this.editorContainer);

    this.editor = new TiptapEditor({
      element: editorMount,
      extensions: [Extension.configure(options.extensionOptions), ...(options.extensions ?? [])],
      content: preprocessHTML(this.textarea.value),
      onUpdate: ({ editor }) => {
        this.textarea.value = editor.getHTML();
      },
    });

    this.toolbar = new Toolbar({
      target: toolbarMount,
      editor: this.editor,
      toolbar: options.toolbar,
      options: options.toolbarOptions ?? {},
      inline: options.inline,
    });

    const statusbarMount = initBarMount(
      options.statusbarContainer,
      "mt-rich-text-editor-statusbar"
    );
    this.statusbar = new Statusbar({
      target: statusbarMount,
      editor: this.editor,
      statusbar: options.statusbar ?? [],
      options: options.statusbarOptions ?? {},
      inline: options.inline,
    });

    this.initResizeHandle(editor);
  }

  public save(): void {
    this.textarea.value = this.getContent();
  }

  public getContent(): string {
    return normalizeHTML(this.editor.getHTML());
  }

  public setContent(content: string): void {
    this.editor.commands.setContent(preprocessHTML(content));
    this.textarea.value = content;
  }

  public getHeight(): number {
    return this.wrapper.clientHeight;
  }

  public setHeight(height: number): void {
    if (height === 0) {
      return;
    }
    this.wrapper.style.height = `${height}px`;
  }

  public focus(): void {
    this.editor.commands.focus();
  }

  public destroy(): void {
    this.toolbar.destroy();
    this.statusbar.destroy();
    this.editor.destroy();
    this.wrapper.remove();
  }

  public insertContent(content: string): void {
    this.editor.commands.insertContent(content);
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
