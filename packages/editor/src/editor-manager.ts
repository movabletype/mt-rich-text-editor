import { version } from "../package.json";
import i18n from "./i18n";
import { Editor } from "./editor";
import type { EditorOptions } from "./editor";
import "./ui/item/registry";
import * as TiptapCore from "@tiptap/core";
import * as Component from "./component";
import { getPanelItem } from "./ui/item/registry";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventHandler = (...args: any[]) => void;

export interface EditorCreateOptions extends EditorOptions {
  id: string;
  language?: string;
}

export class EditorManager {
  public static version: string = version;
  public static Editors: Record<string, Editor> = {};
  public static Component = {
    ...Component,
    getPanelItem,
  };
  static #eventHandlers: Record<string, EventHandler[]> = {};

  public static on(name: "create", handler: (options: EditorCreateOptions) => void): void;
  public static on(name: "init", handler: (editor: Editor) => void): void;
  public static on(name: string, handler: EventHandler): void {
    if (!this.#eventHandlers[name]) {
      this.#eventHandlers[name] = [];
    }
    this.#eventHandlers[name].push(handler);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static #emit(name: string, ...args: any[]): void {
    const handlers = this.#eventHandlers[name] || [];
    handlers.forEach((handler) => handler(...args));
  }

  public static async create(options: EditorCreateOptions): Promise<Editor> {
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

    const editorCreateOptions = {
      toolbar: [],
      toolbarOptions: {},
      statusbar: [["path"]],
      statusbarOptions: {},
      pasteMenu: ["embedInline", "embed", "html", "link", "text", "markdown"],
      pasteMenuOptions: {},
      quickAction: ["heading:1", "heading:2", "heading:3", "heading:4", "heading:5", "heading:6"],
      quickActionOptions: {},
      extensions: [],
      inline: false,
      ...(options as EditorOptions & EditorCreateOptions),
    } as EditorOptions & EditorCreateOptions;

    this.#emit("create", editorCreateOptions);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, language: __, ...editorOptions } = editorCreateOptions;

    const editor = new Editor(textarea, editorOptions);

    this.#emit("init", editor);

    EditorManager.Editors[id] = editor;

    return editor;
  }

  public static unload({ id }: { id: string }): void {
    if (EditorManager.Editors[id]) {
      EditorManager.Editors[id].destroy();
      delete EditorManager.Editors[id];
    }
  }

  public static get({ id }: { id: string }): Editor | undefined {
    return EditorManager.Editors[id];
  }

  public static async save(): Promise<void> {
    await Promise.all(Object.values(EditorManager.Editors).map((editor) => editor.save()));
  }

  public static async import(name: "@tiptap/core"): Promise<typeof import("@tiptap/core")>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static async import(name: string): Promise<any> {
    if (name === "@tiptap/core") {
      return TiptapCore;
    }
    throw new Error(`Unknown module: ${name}`);
  }
}
