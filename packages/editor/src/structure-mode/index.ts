import { mount, unmount } from "svelte";
import type { Editor } from "../editor";
import type { EditorEvents } from "@tiptap/core";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { StructureData } from "./StructureModal.svelte";
import StructureModal from "./StructureModal.svelte";

export class StructureMode {
  #editor: Editor;
  #onUpdateCallback: (event: EditorEvents["update"]) => void;
  #style: HTMLStyleElement;
  #clickCallback: (event: MouseEvent) => void;
  #modal: ReturnType<typeof mount> | null = null;
  #selector = "section, div, p, ul, ol, li, h1, h2, h3, h4, h5, h6";

  constructor(editor: Editor) {
    this.#editor = editor;
    this.#onUpdateCallback = this.onUpdate.bind(this);

    this.#clickCallback = (event: MouseEvent) => {
      const domNode = event.currentTarget as HTMLElement;
      if (event.target !== domNode) {
        return;
      }

      const rect = domNode.getBoundingClientRect();
      if (event.clientY - rect.top > 13) {
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

            // `indent`/`textAlign` are only present in the node's attrs when the
            // corresponding extension manages that attribute for this node type
            // (see Indent/TextAlign extension `types` options).
            const hasIndentAttr = Object.prototype.hasOwnProperty.call(node.attrs, "indent");
            const hasTextAlignAttr = Object.prototype.hasOwnProperty.call(node.attrs, "textAlign");
            const textAlignExtension = this.#editor.tiptap.extensionManager.extensions.find(
              (extension) => extension.name === "textAlign"
            );
            const alignments: string[] = (
              textAlignExtension?.options as { alignments?: string[] } | undefined
            )?.alignments ?? ["left", "center", "right", "justify"];

            // padding-left / text-align are routed to the dedicated indent/textAlign
            // attributes so they stay in sync with those extensions instead of being
            // duplicated (and going stale) inside MTRichTextEditorHTMLAttributes.style.
            let indentValue: string | null = null;
            let textAlignValue: string | null = null;
            const remainingDeclarations: string[] = [];

            const declarations: string[] = (structureData.style || "")
              .split(";")
              .map((declaration: string) => declaration.trim())
              .filter((declaration: string) => declaration.length > 0);

            for (const declaration of declarations) {
              const separatorIndex = declaration.indexOf(":");
              if (separatorIndex === -1) {
                remainingDeclarations.push(declaration);
                continue;
              }

              const property = declaration.slice(0, separatorIndex).trim().toLowerCase();
              const value = declaration.slice(separatorIndex + 1).trim();

              if (!value) {
                continue;
              }

              if (hasIndentAttr && property === "padding-left") {
                indentValue = value;
                continue;
              }

              if (hasTextAlignAttr && property === "text-align" && alignments.includes(value)) {
                textAlignValue = value;
                continue;
              }

              remainingDeclarations.push(declaration);
            }

            const newAttrs = { ...node.attrs.MTRichTextEditorHTMLAttributes };
            const attrNameMap = {
              className: "class",
            } as Record<keyof StructureData, string>;
            (["id", "className"] as (keyof StructureData)[]).forEach((attr) => {
              newAttrs[attrNameMap[attr] ?? attr] = structureData[attr] || undefined;
            });
            newAttrs.style =
              remainingDeclarations.length > 0 ? remainingDeclarations.join("; ") : undefined;

            let transaction = this.#editor.tiptap.state.tr.setNodeAttribute(
              pos - 1,
              "MTRichTextEditorHTMLAttributes",
              newAttrs
            );
            if (hasIndentAttr) {
              transaction = transaction.setNodeAttribute(pos - 1, "indent", indentValue);
            }
            if (hasTextAlignAttr) {
              transaction = transaction.setNodeAttribute(
                pos - 1,
                "textAlign",
                textAlignValue ?? ""
              );
            }
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

    const domNodes = this.#editor.tiptap.view.dom.querySelectorAll<HTMLElement>(this.#selector);
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
    const domNodes = this.#editor.tiptap.view.dom.querySelectorAll<HTMLElement>(this.#selector);
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
