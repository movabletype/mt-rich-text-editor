import type { Editor } from "../../../editor";

export interface Props<T = Record<string, unknown>> {
  options: T;
  tiptap: Editor["tiptap"];
  onUpdate: (callback: (ev: { editor: Editor }) => void) => void;
}

export const extend = (customElementConstructor: typeof HTMLElement) =>
  class extends customElementConstructor implements Props {
    public onUpdate: (callback: (ev: { editor: Editor }) => void) => void;
    #tiptap: Editor["tiptap"] | undefined;
    #onUpdateCallback: (ev: { editor: Editor }) => void;
    constructor() {
      super();
      this.#onUpdateCallback = () => {};
      this.onUpdate = (callback: (ev: { editor: Editor }) => void) => {
        this.#onUpdateCallback = callback;
      };
    }
    get options() {
      return JSON.parse(this.dataset.options || "{}");
    }
    get tiptap() {
      if (!this.#tiptap) {
        throw new Error("tiptap is not initialized");
      }
      return this.#tiptap;
    }
    mtRichTextEditorInit(editor: Editor) {
      this.#tiptap = editor.tiptap;
    }
    mtRichTextEditorUpdate(editor: Editor) {
      this.#onUpdateCallback({ editor });
    }
  };
