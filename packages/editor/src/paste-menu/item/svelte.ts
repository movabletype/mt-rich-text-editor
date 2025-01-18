import { extend } from "../../ui/item/svelte";
import { PasteMenuItemElement } from "./element";
import css from "./element.css?raw";

const pasteMenuItemStyle = document.createElement("style");
pasteMenuItemStyle.textContent = css;
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

    connectedCallback() {
      // @ts-ignore
      super.connectedCallback();
      this.shadowRoot.appendChild(pasteMenuItemStyle.cloneNode(true));
    }

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
