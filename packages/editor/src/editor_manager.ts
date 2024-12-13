import { version } from "../package.json";
import Quill from "quill";
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
  toolbar?: (string | Record<string, string | string[]>)[][];
  inline?: boolean;
}

export class EditorManager {
  public static version: string = version;
  public static Editors: Record<string, Editor> = {};

  public static setIcons(icons: Record<string, string>): void {
    Object.assign(globalIcons, icons);
  }

  public static setLanguage(language: string): void {
    i18n.changeLanguage(language);
  }

  public static setHandlers(handlers: Record<string, (editor: Editor) => void>): void {
    if (!MovableTypeTheme.DEFAULTS.modules.toolbar?.handlers) {
      return;
    }
    Object.assign(MovableTypeTheme.DEFAULTS.modules.toolbar.handlers, handlers);
  }

  public static async create({ id, toolbar, inline }: EditorOptions): Promise<Editor> {
    if (EditorManager.Editors[id]) {
      throw new Error("Editor already exists");
    }
    const textarea = document.getElementById(id) as HTMLTextAreaElement | null;
    if (!textarea) {
      throw new Error("Textarea not found");
    }

    const editor = document.createElement("div");
    textarea.style.display = "none";
    textarea.parentNode?.insertBefore(editor, textarea.nextSibling);

    editor.innerHTML = textarea.value ?? "";

    const quill = new Quill(editor, {
      modules: {
        toolbar,
      },
      theme: inline ? "mt-inline" : "mt",
    });
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
