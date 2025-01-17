import type { Editor } from "../../../editor";
import {
  PanelItemElement,
  ToolbarItemElement,
  StatusbarItemElement,
  PasteMenuItemElement,
  QuickActionItemElement,
} from "../element";

export const extend = (customElementConstructor: typeof HTMLElement): new () => PanelItemElement =>
  class extends customElementConstructor implements PanelItemElement {
    editor: Editor | undefined;
    options: Record<string, any> = {};

    get tiptap() {
      return this.editor?.tiptap;
    }
    get shadowRoot(): ShadowRoot {
      return super.shadowRoot!;
    }

    onEditorInit(editor: Editor, options: Record<string, any>) {
      this.editor = editor;
      this.options = options;
    }
    onEditorUpdate() {}
  };

export const extendStatusbarItem = (
  customElementConstructor: typeof HTMLElement
): new () => StatusbarItemElement =>
  class extends extend(customElementConstructor) implements StatusbarItemElement {};

export const extendPasteMenuItem = (
  customElementConstructor: typeof HTMLElement
): new () => PasteMenuItemElement =>
  class extends extend(customElementConstructor) implements PasteMenuItemElement {
    public content:
      | {
          plainText: string;
          htmlDocument: Document;
          targetDomNode: HTMLElement | null;
          clipboardData: DataTransfer;
          transaction: (cb: () => void) => void;
        }
      | undefined = undefined;
    onEditorSetPasteContent(content: {
      plainText: string;
      htmlDocument: Document;
      targetDomNode: HTMLElement | null;
      clipboardData: DataTransfer;
      transaction: (cb: () => void) => void;
    }) {
      this.content = content;
    }

    isEditorItemAvailable() {
      return true;
    }

    insertPasteContent(content: string) {
      return PasteMenuItemElement.prototype.insertPasteContent.bind(this)(content);
    }

    onEditorPaste() {}
  };

export const extendQuickActionItem = (
  customElementConstructor: typeof HTMLElement
): new () => QuickActionItemElement =>
  class extends extend(customElementConstructor) implements QuickActionItemElement {};
