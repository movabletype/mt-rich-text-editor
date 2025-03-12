/* eslint-disable @typescript-eslint/ban-ts-comment */
import { t } from "../../i18n";
import Html from "./Html.svelte";
import Link from "./Link.svelte";
import Embed from "./Embed.svelte";
import EmbedInline from "./EmbedInline.svelte";
import Markdown from "./Markdown.svelte";

import { PasteMenuItemElement } from "./element";

export class AsText extends PasteMenuItemElement {
  constructor() {
    super();
    const button = document.createElement("button");
    button.textContent = t("Paste as text");
    this.shadowRoot.appendChild(button);
  }

  onEditorPaste() {
    const encoder = document.createElement("div");
    encoder.textContent = this.content?.plainText ?? "";
    this.insertContent(encoder.innerHTML.replace(/\n/g, "<br>"));
    // TBD: enclose with <p> tag
    // this.insertContent(preprocessHTML(`<p>${encoder.innerHTML}</p>`));
  }

  connectedCallback() {
    this.addEventListener("click", () => {
      this.onEditorPaste();
    });
  }
}

export default {
  text: AsText,
  // @ts-ignore
  html: Html.element!,
  // @ts-ignore
  link: Link.element!,
  // @ts-ignore
  embed: Embed.element!,
  // @ts-ignore
  embedInline: EmbedInline.element!,
  // @ts-ignore
  markdown: Markdown.element!,
};
