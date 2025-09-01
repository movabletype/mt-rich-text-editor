import { PanelItemElement } from "../../ui/item/element";
import css from "./element.css?raw";

/**
 * QuickActionItemElement
 */
const quickActionItemStyle = document.createElement("style");
quickActionItemStyle.textContent = css;
export class QuickActionItemElement extends PanelItemElement {
  aliases?: string[];
  variant?: string;

  constructor() {
    super();
    this.shadowRoot.appendChild(quickActionItemStyle.cloneNode(true));
  }

  connectedCallback() {
    this.variant = this.dataset.mtRichTextEditorPanelItemVariant;
  }

  insertContent(content: string) {
    const tiptap = this.tiptap;
    if (!tiptap) {
      return;
    }

    const isFirstContent = tiptap.state.doc.childCount <= 1;

    tiptap.chain().focus().undo().insertContent(content).run();

    if (isFirstContent) {
      tiptap.chain().blur().focus("end").run();
    }
  }
}
