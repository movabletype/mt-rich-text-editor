import type { Editor } from "../../editor";
import { PanelItemElement } from "./element";

export const extend = (customElementConstructor: typeof HTMLElement): new () => PanelItemElement =>
  class extends customElementConstructor implements PanelItemElement {
    editor: Editor | undefined;
    options: Record<string, unknown> = {};

    get tiptap() {
      return this.editor?.tiptap;
    }
    get shadowRoot(): ShadowRoot {
      return super.shadowRoot!;
    }

    onEditorInit(editor: Editor, options: Record<string, unknown>) {
      this.editor = editor;
      this.options = options;
    }
    onEditorUpdate() {}
  };
