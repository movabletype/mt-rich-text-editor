import { Editor as TiptapEditor, Extension as TiptapExtension } from "@tiptap/core";
import { Extension } from "./tiptap/extension";
import { Toolbar } from "./toolbar";
import { preprocessHTML, normalizeHTML } from "./util";
import prosemirrorCss from "prosemirror-view/style/prosemirror.css?raw";
import "./editor.css";

interface EditorOptions {
  inline: boolean;
  toolbar: string[][][];
  toolbarContainer?: HTMLDivElement;
  toolbarOptions?: Record<string, any>;
  extensions?: TiptapExtension[];
  extensionOptions?: Record<string, any>;
}

export class Editor {
  private textarea: HTMLTextAreaElement;
  public editor: TiptapEditor;
  private wrapper: HTMLDivElement;
  private editorContainer: HTMLDivElement;
  private toolbar: Toolbar;

  constructor(textarea: HTMLTextAreaElement, options: EditorOptions) {
    this.textarea = textarea;

    this.wrapper = document.createElement("div");
    this.wrapper.className = "mt-rich-text-editor";
    this.textarea.parentNode?.insertBefore(this.wrapper, this.textarea);
    this.textarea.style.display = "none";
    const toolbarContainer = options.toolbarContainer ?? document.createElement("div");
    this.wrapper.appendChild(toolbarContainer);

    this.editorContainer = document.createElement("div");
    const shadow = this.editorContainer.attachShadow({ mode: "open" });

    const styleSheet = document.createElement("style");
    styleSheet.textContent = prosemirrorCss;
    shadow.appendChild(styleSheet);

    const editorMount = document.createElement("div");
    shadow.appendChild(editorMount);
    this.wrapper.appendChild(this.editorContainer);

    this.editor = new TiptapEditor({
      element: editorMount,
      extensions: [Extension.configure(options.extensionOptions), ...(options.extensions ?? [])],
      content: preprocessHTML(this.textarea.value),
      onUpdate: ({ editor }) => {
        this.textarea.value = editor.getHTML();
      },
    });

    this.toolbar = new Toolbar({
      target: toolbarContainer,
      editor: this.editor,
      toolbar: options.toolbar,
      options: options.toolbarOptions ?? {},
      inline: options.inline,
    });
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
    this.editor.destroy();
    this.wrapper.remove();
  }

  public insertContent(content: string): void {
    this.editor.commands.insertContent(content);
  }
}
