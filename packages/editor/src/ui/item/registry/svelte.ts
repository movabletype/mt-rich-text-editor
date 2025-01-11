import type { Editor } from "../../../editor";

export interface Props<T = Record<string, unknown>> {
  options: T;
  editor: Editor | undefined;
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
    editor: Editor | undefined;
    #onUpdateCallback: (ev: { editor: Editor }) => void = () => {};
    options: Record<string, any> = {};

    get tiptap() {
      return this.editor?.tiptap;
    }
    onUpdate = (callback: (ev: { editor: Editor }) => void) => {
      this.#onUpdateCallback = callback;
    };

    onEditorInit(editor: Editor, options: Record<string, any>) {
      this.editor = editor;
      this.options = options;
    }
    onEditorUpdate(editor: Editor) {
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

    onEditorSetPasteContent(content: {
      plainText: string;
      htmlDocument: Document;
      clipboardData: DataTransfer;
      transaction: (cb: () => void) => void;
    }) {
      this.content = content;
    }

    onEditorPaste() {
      this.#onApplyCallback();
    }

    onApply = (callback: () => void) => {
      this.#onApplyCallback = callback;
    };

    getContent = () => {
      return this.content;
    };
  };
