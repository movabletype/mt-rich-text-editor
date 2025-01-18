import { extend } from "../../ui/item/svelte";
import { ToolbarItemElement } from "./element";
import css from "./element.css?raw";

const toolbarItemStyle = document.createElement("style");
toolbarItemStyle.textContent = css;
export const extendToolbarItem = (
  customElementConstructor: typeof HTMLElement
): new () => ToolbarItemElement =>
  class extends extend(customElementConstructor) implements ToolbarItemElement {
    connectedCallback() {
      // @ts-ignore
      super.connectedCallback();
      this.shadowRoot.appendChild(toolbarItemStyle.cloneNode(true));
    }
  };
