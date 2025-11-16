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
 * Base class for paste menu item
 *
 * @example
 *
 *  customElements.define(
 *    "mt-rich-text-editor-paste-menu-item-myitem",
 *    class extends PasteMenuItemElement {
 *      constructor() {
 *        super();
 *        const button = document.createElement("button");
 *        button.textContent = "My Paste Item";
 *        this.shadowRoot.appendChild(button);
 *      }
 *
 *      isEditorItemAvailable() {
 *        return /^https?:\/\//.test(this.content?.plainText);
 *      }
 *
 *      async onEditorPaste() {
 *        this.insertContent(this.content?.plainText);
 *      }
 *
 *      connectedCallback() {
 *        this.addEventListener('click', () => {
 *          this.onEditorPaste();
 *        });
 *      }
 *    }
 *  );
 */
export abstract class PasteMenuItemElement<
  Options extends Record<string, unknown> = Record<string, unknown>,
> extends PanelItemElement<Options> {
  static Priority = PasteMenuItemPriority;
  public content?:
    | {
        plainText: string;
        htmlDocument: Document | null;
        targetDomNode: HTMLElement | Text | null;
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
    targetDomNode: HTMLElement | Text | null;
    clipboardData: DataTransfer;
    transaction: (cb: () => void | Promise<void>) => void;
  }) {
    this.content = content;
  }

  insertContent(content: string | Record<string, unknown>) {
    this.content?.transaction(() => {
      this.tiptap?.chain().undo().focus().run();
      this.tiptap?.commands.insertContent(
        typeof content === "string" ? preprocessHTML(content) : content
      );
    });
    this.parentElement?.dispatchEvent(new Event("paste-menu-item-applied"));
  }

  onEditorPaste() {
    throw new Error("onEditorPaste is not implemented");
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace svelteHTML {
    interface HTMLAttributes {
      "onpaste-menu-item-applied"?: (event: CustomEvent) => void;
    }
  }
}
