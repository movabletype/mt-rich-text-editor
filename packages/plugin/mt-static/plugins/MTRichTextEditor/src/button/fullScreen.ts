import { EditorToolbarItemClickEvent } from "@movabletype/";
import type { Editor } from "@movabletype/mt-rich-text-editor";
import { toggleFullScreen } from "../util/full_screen";
import fullScreenIcon from "../assets/full_screen.svg?raw";

class FullScreenButton extends HTMLElement {
  constructor() {
    super();
    const svg = document.createElement("svg");
    svg.innerHTML = fullScreenIcon;
    this.attachShadow({ mode: "open" }).appendChild(svg);
  }

  connectedCallback() {
    this.addEventListener("editor-toolbar-item-click", (ev: Event) => {
      const editor = (ev as EditorToolbarItemClickEvent).detail.editor;
    this.addEventListener("click", () => {
      toggleFullScreen("editor-input-content");
    });
  }
}

customElements.define("mt-rich-text-editor-full-screen-button", FullScreenButton);


export class InsertHtmlButton extends HTMLElement {
  constructor() {
    super();
    const svg = document.createElement("svg");
    svg.innerHTML = insertHtmlIcon;
    this.attachShadow({ mode: "open" }).appendChild(svg);
  }

  connectedCallback() {
    this.addEventListener("editor-toolbar-item-click", (ev: Event) => {
      const editor = (ev as EditorToolbarItemClickEvent).detail.editor;
      const modal = mount(InsertHtmlModal, {
        target: document.body,
        props: {
          text: normalizeHTML(editor.getHTML()),
          onSubmit: (html: string) => {
            editor.commands.insertContent(preprocessHTML(html));
            unmount(modal);
          },
          onClose: () => {
            unmount(modal);
          },
        },
      });
    });
  }
}
