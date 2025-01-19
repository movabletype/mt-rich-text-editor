import { t } from "../../i18n";
import { QuickActionItemElement } from "./element";

import h1Icon from "../../ui/icon/heading1.svg?raw";
import h2Icon from "../../ui/icon/heading2.svg?raw";
import h3Icon from "../../ui/icon/heading3.svg?raw";
import h4Icon from "../../ui/icon/heading4.svg?raw";
import h5Icon from "../../ui/icon/heading5.svg?raw";
import h6Icon from "../../ui/icon/heading6.svg?raw";

const icons: Record<string, string> = {
  1: h1Icon,
  2: h2Icon,
  3: h3Icon,
  4: h4Icon,
  5: h5Icon,
  6: h6Icon,
};
export class Heading extends QuickActionItemElement {
  connectedCallback() {
    const level = this.dataset.mtRichTextEditorPanelItemVariant;
    if (!level) {
      return;
    }

    this.aliases = [`h${level}`, `heading${level}`];

    const button = document.createElement("button");
    const icon = document.createElement("span");
    icon.classList.add("icon");
    icon.innerHTML = icons[level];
    const label = document.createElement("span");
    label.textContent = t(`Heading ${level}`);
    button.appendChild(icon);
    button.appendChild(label);
    this.shadowRoot.appendChild(button);

    this.addEventListener("click", () => {
      this.tiptap
        ?.chain()
        .focus()
        .selectParentNode()
        .insertContent(`<h${level}></h${level}>`)
        .run();
    });
  }
}
