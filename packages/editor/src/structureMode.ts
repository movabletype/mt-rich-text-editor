import { mount, unmount } from "svelte";
import type { Editor } from "./editor";
import type { EditorEvents } from "@tiptap/core";
import StructureModal from "./StructureModal.svelte";
import type { StructureData } from "./StructureModal.svelte";

export class StructureMode {
  #editor: Editor;
  #onUpdateCallback: (event: EditorEvents["update"]) => void;
  #style: HTMLStyleElement;
  #clickCallback: (event: MouseEvent) => void;
  #modal: ReturnType<typeof mount> | null = null;

  constructor(editor: Editor) {
    this.#editor = editor;
    this.#onUpdateCallback = this.onUpdate.bind(this);

    this.#clickCallback = (event: MouseEvent) => {
      const domNode = event.currentTarget as HTMLElement;
      if (event.target !== domNode) {
        return;
      }

      const rect = domNode.getBoundingClientRect();
      if (event.clientY - rect.top > 20) {
        return;
      }

      this.#modal = mount(StructureModal, {
        target: document.body,
        props: {
          structureData: {
            id: domNode.id,
            className: domNode.className,
            style: domNode.style.cssText,
          },
          onSubmit: (structureData: StructureData) => {
            const pos = this.#editor.tiptap.view.posAtDOM(domNode, 0);
            const node = this.#editor.tiptap.state.doc.nodeAt(pos - 1);
            if (!node) {
              return;
            }
            const newAttrs = { ...node.attrs.MTRichTextEditorHTMLAttributes };
            if (structureData.id) {
              newAttrs.id = structureData.id;
            }
            if (structureData.className) {
              newAttrs.class = structureData.className;
            }
            if (structureData.style) {
              newAttrs.style = structureData.style;
            }
            const transaction = this.#editor.tiptap.state.tr.setNodeAttribute(
              pos - 1,
              "MTRichTextEditorHTMLAttributes",
              newAttrs
            );
            this.#editor.tiptap.view.dispatch(transaction);

            if (this.#modal) {
              unmount(this.#modal);
              this.#modal = null;
            }
          },
          onClose: () => {
            if (this.#modal) {
              unmount(this.#modal);
              this.#modal = null;
            }
          },
        },
      });
    };

    this.#style = document.createElement("style");
    this.#editor.tiptap.view.dom.getRootNode().appendChild(this.#style);

    this.#editor.tiptap.on("update", this.#onUpdateCallback);
    this.onUpdate();
  }

  public onUpdate(): void {
    let style = "";

    const domNodes = this.#editor.tiptap.view.dom.querySelectorAll<HTMLElement>(
      "section, div, p, ul, ol, li, h1, h2, h3, h4, h5, h6"
    );
    for (const domNode of domNodes) {
      domNode.removeEventListener("click", this.#clickCallback);
      domNode.addEventListener("click", this.#clickCallback);

      const selector = `${domNode.tagName.toLowerCase()}${domNode
        .getAttributeNames()
        .map((name) => {
          if (name === "data-mt-rich-text-editor-id") {
            return "";
          }
          if (!["id", "class", "style"].includes(name)) {
            return "";
          }
          return `[${name}="${domNode.getAttribute(name)}"]`;
        })
        .join("")}`;
      style += `${selector} {
    outline: 1px solid rgba(0, 0, 0, 0.2);
    padding: 0.5rem;
    margin: 1rem 0;
    border-radius: 0.5rem;
    position: relative;
    &:before {
      content: "${selector.replace(/"/g, '\\"')}";
      position: absolute;
      top: -0.8rem;
      left: 0.5rem;
      display: block;
      background-color: #fff;
      padding: 0 0.5rem;
      font-weight: normal;
      font-size: 1rem;
      cursor: pointer;
    }
  }
      `;
    }
    this.#style.textContent = style;
  }

  public destroy(): void {
    const domNodes = this.#editor.tiptap.view.dom.querySelectorAll<HTMLElement>(
      "section, h1, h2, h3, h4, h5, h6"
    );
    for (const domNode of domNodes) {
      domNode.removeEventListener("click", this.#clickCallback);
    }
    this.#style.remove();
    if (this.#modal) {
      unmount(this.#modal);
      this.#modal = null;
    }
    this.#editor.tiptap.off("update", this.#onUpdateCallback);
  }
}
