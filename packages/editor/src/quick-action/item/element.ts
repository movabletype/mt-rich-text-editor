import { PanelItemElement } from "../../ui/item/element";
import css from "./element.css?raw";

/**
 * Base class for quick action item
 *
 * @example
 *
 *  customElements.define(
 *    "mt-rich-text-editor-quick-action-item-myitem",
 *    class extends QuickActionItemElement {
 *      constructor() {
 *        super();
 *
 *        // The string specified in `this.aliases` is the target of the search.
 *        this.aliases = ["myitem"];
 *
 *        const button = document.createElement("button");
 *        this.shadowRoot.appendChild(button);
 *
 *        const icon = document.createElement("span");
 *        icon.classList.add("icon");
 *        icon.innerHTML = `<svg
 *                           xmlns="http://www.w3.org/2000/svg"
 *                           width="24"
 *                           height="24"
 *                           viewBox="0 0 24 24"
 *                         >
 *                           <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle">
 *                             MI
 *                           </text>
 *                         </svg>`;
 *        button.appendChild(icon);
 *
 *        const title = document.createElement("span");
 *        title.textContent = "My Item";
 *        button.appendChild(title);
 *
 *        this.addEventListener("click", () => {
 *          this.insertContent("<p>This is my item!</p>");
 *        });
 *      }
 *    }
 *  );
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
