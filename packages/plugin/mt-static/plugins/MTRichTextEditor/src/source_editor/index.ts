import { MT } from "@movabletype/app";
import { getCustomSettings } from "../util/settings";
import SourceEditor from "./editor";

const MTEditor = MT.Editor || (class {} as NonNullable<typeof MT.Editor>);

class MTSourceEditor extends MTEditor {
  editor?: SourceEditor;

  static formats() {
    return [
      "source",
      "textarea", // only for fallback, not used
    ];
  }

  async initEditor(format: string) {
    const customSettings = getCustomSettings();
    this.editor = new SourceEditor({
      id: this.id,
      toolbarOptions: {
        link: customSettings?.link ?? {},
      },
    });
    this.editor.setFormat(format);
  }

  async initOrShow(format: string) {
    await this.initEditor(format);
  }

  hide() {
    this.editor?.unload();
    this.editor = undefined;
  }
}

MT.EditorManager?.register("mt_source_editor", MTSourceEditor);
