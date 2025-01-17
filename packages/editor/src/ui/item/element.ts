import type { Editor as TiptapEditor } from "@tiptap/core";
import type { Editor } from "../../editor";
import { preprocessHTML } from "../../util/html";

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

/**
 * Base class for toolbar item
 *
 * @example
 *
 *  customElements.define(
 *    "mt-rich-text-editor-toolbar-item-myitem",
 *    class extends ToolbarItemElement {
 *      constructor() {
 *        super();
 *        this.shadowRoot.innerHTML = 'My Item';
 *      }
 *
 *      connectedCallback() {
 *        this.addEventListener("click", () => {
 *          this.tiptap?.commands.insertContent("<p>Hello</p>");
 *        });
 *      }
 *    }
 *  );
 */
export class ToolbarItemElement<
  Options extends Record<string, any> = Record<string, any>,
> extends PanelItemElement<Options> {}

/**
 * StatusbarItemElement
 */
export class StatusbarItemElement<
  Options extends Record<string, any> = Record<string, any>,
> extends PanelItemElement<Options> {}

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

/**
 * QuickActionItemElement
 */
export class QuickActionItemElement extends PanelItemElement {
  constructor() {
    super();
    const style = document.createElement("style");
    style.textContent = `
      button {
        display: flex;
        align-items: center;
        gap: 10px;
        background: none;
        border: none;
        margin: 0;
        padding: 0;
        cursor: pointer;
        font-size: inherit;
      }
      .icon:not(svg) {
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 4px;
      }
    `;
    this.shadowRoot.appendChild(style);
  }
}
