import { version } from "../package.json";
import Quill from "quill";
import { Editor } from "./editor";
import globalIcons from "quill/ui/icons";
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
}

export class EditorManager {
  public static version: string = version;
  public static Editors: Record<string, Editor> = {};

  public static setIcons(icons: Record<string, string>): void {
    Object.assign(globalIcons, icons);
  }

  public static async create({ id }: EditorOptions): Promise<Editor> {
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

    editor.innerHTML = textarea.value;

    const quill = new Quill(editor, {
      modules: {
        toolbar: [
          ["bold", "italic", "underline", "strike"],
          ["blockquote", { list: "ordered" }, { list: "bullet" }, "hr"],
          ["link"],
          [],
          ["undo", "redo"],
          [{ color: [] }, { background: [] }, "clean"],
          [{ align: "" }, { align: "center" }, { align: "right" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ header: [] }],
        ],
      },
      theme: "mt",
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
