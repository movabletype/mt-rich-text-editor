import type { Editor } from "../../../editor";

export interface Props<T = Record<string, unknown>> {
  options: T;
  tiptap: Editor["tiptap"] | undefined;
  onUpdate: (callback: (ev: { editor: Editor }) => void) => void;
}

export interface PasteItemProps<T = Record<string, unknown>> extends Props<T> {
  getContent(): {
    plainText: string;
    htmlDocument: Document;
    clipboardData: DataTransfer;
    transaction: (cb: () => void) => void;
  } | undefined;
  onApply: (callback: () => void) => void;
}

export const extend = (
  customElementConstructor: typeof HTMLElement
): new () => HTMLElement & Props =>
  class extends customElementConstructor implements Props {
    #editor: Editor | undefined;
    #onUpdateCallback: (ev: { editor: Editor }) => void = () => {};

    get options() {
      return JSON.parse(this.dataset.options || "{}");
    }
    get tiptap() {
      return this.#editor?.tiptap;
    }
    onUpdate = (callback: (ev: { editor: Editor }) => void) => {
      this.#onUpdateCallback = callback;
    };

    mtRichTextEditorInit(editor: Editor) {
      this.#editor = editor;
    }
    mtRichTextEditorUpdate(editor: Editor) {
      this.#onUpdateCallback({ editor });
    }
  };

export const extendPasteItem = (
  customElementConstructor: typeof HTMLElement
): new () => HTMLElement & PasteItemProps =>
  class extends extend(customElementConstructor) implements PasteItemProps {
    protected content:
    | {
        plainText: string;
        htmlDocument: Document;
        clipboardData: DataTransfer;
        transaction: (cb: () => void) => void;
      }
    | undefined = undefined;
    #onApplyCallback: () => void = () => {};

    mtRichTextEditorSetContent(content: {
      plainText: string;
      htmlDocument: Document;
      clipboardData: DataTransfer;
      transaction: (cb: () => void) => void;
    }) {
      this.content = content;
    }

    mtRichTextEditorApply() {
      this.#onApplyCallback();
    }

    onApply = (callback: () => void) => {
      this.#onApplyCallback = callback;
    };

    getContent = () => {
      return this.content;
    };
  };
