import { PanelItemElement } from "../../ui/item/element";
import { preprocessHTML } from "../../util/html";
import css from "./element.css?raw";

const pasteMenuItemStyle = document.createElement("style");
pasteMenuItemStyle.textContent = css;

export const PasteMenuItemPriority = {
  Default: 1,
  High: 2,
} as const;
export type PasteMenuItemPriorityValue =
  (typeof PasteMenuItemPriority)[keyof typeof PasteMenuItemPriority];

/**
 * PasteMenuItemElement
 */
export abstract class PasteMenuItemElement<
  Options extends Record<string, any> = Record<string, any>,
> extends PanelItemElement<Options> {
  static Priority = PasteMenuItemPriority;
  public content?:
    | {
        plainText: string;
        htmlDocument: Document | null;
        targetDomNode: HTMLElement | null;
        clipboardData: DataTransfer;
        transaction: (cb: () => void | Promise<void>) => void;
      }
    | undefined = undefined;

  constructor() {
    super();
    this.shadowRoot.appendChild(pasteMenuItemStyle.cloneNode(true));
  }

  isEditorItemAvailable():
    | boolean
    | PasteMenuItemPriorityValue
    | Promise<boolean | PasteMenuItemPriorityValue> {
    return Promise.resolve(PasteMenuItemPriority.Default);
  }

  onEditorSetPasteContent(content: {
    plainText: string;
    htmlDocument: Document | null;
    targetDomNode: HTMLElement | null;
    clipboardData: DataTransfer;
    transaction: (cb: () => void | Promise<void>) => void;
  }) {
    this.content = content;
  }

  insertPasteContent(content: string) {
    this.content?.transaction(() => {
      this.tiptap?.chain().undo().focus().run();
      this.tiptap?.commands.insertContent(
        typeof content === "string" ? preprocessHTML(content) : content
      );
    });
  }

  onEditorPaste() {
    throw new Error("onEditorPaste is not implemented");
  }
}
