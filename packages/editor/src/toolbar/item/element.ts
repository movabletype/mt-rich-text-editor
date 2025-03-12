import { tooltip } from "../../tooltip";
import { PanelItemElement } from "../../ui/item/element";
import css from "./element.css?raw";

const toolbarItemStyle = document.createElement("style");
toolbarItemStyle.textContent = css;

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
 *        const button = document.createElement("button");
 *        button.title = "My Item";
 *        button.textContent = "My Item";
 *        this.shadowRoot.appendChild(button);
 *      }
 *
 *      connectedCallback() {
 *        super.connectedCallback();
 *        this.addEventListener("click", () => {
 *          this.tiptap?.commands.insertContent("<p>Hello</p>");
 *        });
 *      }
 *    }
 *  );
 */
export class ToolbarItemElement<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Options extends Record<string, any> = Record<string, unknown>,
> extends PanelItemElement<Options> {
  constructor() {
    super();
    this.shadowRoot.appendChild(toolbarItemStyle.cloneNode(true));
  }

  connectedCallback() {
    const button = this.shadowRoot.querySelector("button");
    if (button) {
      tooltip(button);
    }
  }
}
