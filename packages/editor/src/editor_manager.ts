import { version } from "../package.json";
import Quill from "quill";
import type Toolbar from "quill/modules/toolbar";
import type Uploader from "quill/modules/uploader";
import { Editor } from "./editor";
import MovableTypeTheme from "./themes/mt";
import globalIcons from "quill/ui/icons";
import i18n from "./i18n";
import "./blots";
import "./themes/mt";
import "./themes/mt.css";

/**
 * Options for creating an editor.
 */
export interface EditorOptions {
  /**
   * The ID of the textarea element to create the editor for.
   */
  id: string;
  modules?: {
    toolbar?: (string | Record<string, string | string[]>)[][] | (string | Record<string, string | string[]>)[][][];
    uploader?: {
      handler: (this: Uploader, file: File) => void;
    };
    [key: string]: any;
  };
  inline?: boolean;
  content?: string;
  height?: number;
  context?: Record<string, any>;
}

export class EditorManager {
  public static version: string = version;
  public static Editors: Record<string, Editor> = {};

  public static setIcons(icons: Record<string, string>): void {
    Object.assign(globalIcons, icons);
  }

  public static setLanguage(language: string): void {
    i18n.changeLanguage(language);
    document.documentElement.dataset.mtRichTextEditorLanguage = language;
  }

  public static setHandlers(handlers: Record<string, (this: Toolbar) => void>): void {
    if (!MovableTypeTheme.DEFAULTS.modules.toolbar?.handlers) {
      return;
    }
    Object.assign(MovableTypeTheme.DEFAULTS.modules.toolbar.handlers, handlers);
  }

  public static async create({ id, modules, inline, content, height, context }: EditorOptions): Promise<Editor> {
    if (EditorManager.Editors[id]) {
      throw new Error("Editor already exists");
    }
    const textarea = document.querySelector<HTMLTextAreaElement>(`#${id}`);
    if (!textarea) {
      throw new Error("Textarea not found");
    }

    const toolbar = modules?.toolbar?.map((row) => {
      if (Array.isArray(row)) {
        return [...row, []]
      }
      else {
        return [row];
      }
    }).flat(1) as NonNullable<EditorOptions["modules"]>["toolbar"];

    const editor = document.createElement("div");

    editor.dataset.id = id;
    (editor as any).context = context;

    textarea.style.display = "none";
    textarea.parentNode?.insertBefore(editor, textarea.nextSibling);

    editor.innerHTML = content ?? textarea.value ?? "";

    const quill = new Quill(editor, {
      modules: {
        ...modules,
        toolbar,
      },
      theme: inline ? "mt-inline" : "mt",
    });
    if (height) {
      quill.root.style.height = `${height}px`;
    }
    return (EditorManager.Editors[id] = new Editor({
      quill,
      textarea,
    }));
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
