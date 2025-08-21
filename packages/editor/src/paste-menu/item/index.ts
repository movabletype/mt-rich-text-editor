/* eslint-disable @typescript-eslint/ban-ts-comment */
import { t } from "../../i18n";
import Html from "./Html.svelte";
import Link from "./Link.svelte";
import Embed from "./Embed.svelte";
import EmbedInline from "./EmbedInline.svelte";
import Markdown from "./Markdown.svelte";

import { PasteMenuItemElement } from "./element";

export const INTERNAL_PASTE_CONTENT_TYPE = "x-mt-rich-text-editor";

export class AsText extends PasteMenuItemElement {
  constructor() {
    super();
    const button = document.createElement("button");
    button.textContent = t("Paste as text");
    this.shadowRoot.appendChild(button);
  }

  onEditorPaste() {
    const event = new ClipboardEvent("paste", {
      clipboardData: new DataTransfer(),
    });

    event.clipboardData?.setData("text/plain", this.content?.plainText ?? "");
    event.clipboardData?.setData(INTERNAL_PASTE_CONTENT_TYPE, "1");

    this.content?.transaction(() => {
      this.tiptap?.chain().undo().focus().run();
      this.tiptap?.view.dom.dispatchEvent(event);
    });
    this.parentElement?.dispatchEvent(new Event("paste-menu-item-applied"));
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
