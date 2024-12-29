import { version } from "../package.json";
import i18n from "./i18n";
import { Editor } from "./editor";
import { UI } from "./editor_manager/ui";
import type { EditorOptions } from "./editor";

type EventHandler = (...args: any[]) => void;

export interface EditorCreateOptions extends Omit<EditorOptions, "toolbar"> {
  id: string;
  language?: string;
  toolbar?: EditorOptions["toolbar"];
}

console.log(UI.getPanelItem);
export class EditorManager {
  public static version: string = version;
  public static Editors: Record<string, Editor> = {};
  public static ui = UI;
  private static eventHandlers: Record<string, EventHandler[]> = {};

  public static on(name: "create", handler: (options: EditorCreateOptions) => void): void;
  public static on(name: "init", handler: (editor: Editor) => void): void;
  public static on(name: string, handler: EventHandler): void {
    if (!this.eventHandlers[name]) {
      this.eventHandlers[name] = [];
    }
    this.eventHandlers[name].push(handler);
  }

  private static emit(name: string, ...args: any[]): void {
    const handlers = this.eventHandlers[name] || [];
    handlers.forEach((handler) => handler(...args));
  }

  public static async create(options: EditorCreateOptions): Promise<Editor> {
    const { id, language, ...editorOptions } = options;

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

    const editor = new Editor(
      textarea,
      Object.assign(
        {
          toolbar: [
            [
              ["bold", "italic", "underline", "strike"],
              ["blockquote", "bulletList", "orderedList", "horizontalRule"],
              ["link", "unlink"],
              ["insertHtml"],
              ["table"],
              ["boilerplate"],
              ["source"],
            ],
            [
              ["undo", "redo"],
              ["foregroundColor", "backgroundColor", "removeFormat"],
              ["alignLeft", "alignCenter", "alignRight", "indent", "outdent"],
              ["block"],
              ["fullScreen"],
            ],
          ],
          statusbar: [[["path"]]],
          pasteMenu: ["embed", "html", "link", "text"],
          inline: false,
        },
        editorOptions
      )
    );

    this.emit("init", editor);

    EditorManager.Editors[id] = editor;

    return editor;
  }

  public static unload({ id }: { id: string }): void {
    if (EditorManager.Editors[id]) {
      EditorManager.Editors[id].destroy();
      delete EditorManager.Editors[id];
    }
  }

  public static async save(): Promise<void> {
    await Promise.all(Object.values(EditorManager.Editors).map((editor) => editor.save()));
  }
}
