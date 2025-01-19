import { extend } from "../../ui/item/svelte";
import { QuickActionItemElement } from "./element";
import css from "./element.css?raw";

const quickActionItemStyle = document.createElement("style");
quickActionItemStyle.textContent = css;
export const extendQuickActionItem = (
  customElementConstructor: typeof HTMLElement
): new () => QuickActionItemElement =>
  class extends extend(customElementConstructor) implements QuickActionItemElement {
    connectedCallback() {
      // @ts-ignore
      super.connectedCallback();
      this.shadowRoot.appendChild(quickActionItemStyle.cloneNode(true));
    }

    insertContent(content: string) {
      QuickActionItemElement.prototype.insertContent.call(this, content);
    }
  };
