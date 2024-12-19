import type { Extension } from "@tiptap/core";
import { version } from "../package.json";
import i18n from "./i18n";
import { Editor } from "./editor";

type EventHandler = (...args: any[]) => void;

export interface EditorOptions {
  id: string;
  language?: string;
  inline?: boolean;
  toolbar?: string[][][];
  toolbarContainer?: HTMLDivElement;
  toolbarOptions?: Record<string, any>;
  extensions?: Extension[];
  extensionOptions?: Record<string, any>;
}

export class EditorManager {
  public static version: string = version;
  public static Editors: Record<string, Editor> = {};
  private static eventHandlers: Record<string, EventHandler[]> = {};

  public static on(name: "create", handler: (options: EditorOptions) => void): void;
  public static on(name: "init", handler: (editor: Editor) => void): void;
  public static on(name: string, handler: EventHandler): void {
    if (!this.eventHandlers[name]) {
      this.eventHandlers[name] = [];
    }
    this.eventHandlers[name].push(handler);
  }

  public static emit(name: string, ...args: any[]): void {
    const handlers = this.eventHandlers[name] || [];
    handlers.forEach((handler) => handler(...args));
  }

  public static async create(options: EditorOptions): Promise<Editor> {
    const { id, language } = options;

    if (language && i18n.language !== language) {
      i18n.changeLanguage(language);
    }
    if (EditorManager.Editors[id]) {
      throw new Error("Editor already exists");
    }
    const textarea = document.querySelector<HTMLTextAreaElement>(`#${id}`);
    if (!textarea) {
      throw new Error("Textarea not found");
    }

    this.emit("create", options);

    const editor = new Editor(textarea, {
      toolbar: options.toolbar ?? [
        [
          ["bold", "italic", "underline", "strike"],
          ["blockquote", "bulletList", "orderedList", "horizontalRule"],
          ["link", "unlink"],
          ["insertHtml"],
          ["table"],
          ["source"],
        ],
        [
          ["undo", "redo"],
          ["foregroundColor", "backgroundColor", "removeFormat"],
          ["alignLeft", "alignCenter", "alignRight", "indent", "outdent"],
          ["block"],
        ],
      ],
      toolbarContainer: options.toolbarContainer,
      toolbarOptions: options.toolbarOptions,
      inline: options.inline ?? false,
      extensions: options.extensions,
      extensionOptions: options.extensionOptions,
    });

    this.emit("init", editor);

    return editor;
  }

  public static unload({ id }: EditorOptions): void {
    if (EditorManager.Editors[id]) {
      EditorManager.Editors[id].destroy();
      delete EditorManager.Editors[id];
    }
  }

  public static async save(): Promise<void> {
    await Promise.all(Object.values(EditorManager.Editors).map((editor) => editor.save()));
  }
}
