import type { Editor as TiptapEditor } from "@tiptap/core";
import type { Editor } from "../../editor";

export class PanelItemElement<
  Options extends Record<string, any> = Record<string, any>,
> extends HTMLElement {
  get shadowRoot(): ShadowRoot {
    return super.shadowRoot!;
  }

  editor: Editor | undefined;
  options: Options = {} as Options;
  get tiptap(): TiptapEditor | undefined {
    return this.editor?.tiptap;
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  onEditorInit(editor: Editor, options: Options) {
    this.editor = editor;
    this.options = options;
  }

  onEditorUpdate() {}
}
