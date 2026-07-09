import { mount, unmount } from "svelte";
import type { Editor } from "../editor";
import type { EditorEvents } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { StructureData } from "./StructureModal.svelte";
import StructureModal from "./StructureModal.svelte";

// prosemirror-view assigns the internal ViewDesc it uses to manage a piece
// of DOM to that DOM node as `pmViewDesc` (see prosemirror-view's
// `NodeViewDesc`/`ViewDesc` base class). It is not part of prosemirror-view's
// public type definitions (`ViewDesc` itself isn't exported), so it's
// accessed here through this narrow, locally-defined shape covering only
// the bit we need: the ProseMirror document node the DOM corresponds to.
type DOMWithViewDesc = HTMLElement & { pmViewDesc?: { node?: { type: { name: string } } } };

/**
 * The Table extension's NodeView (see tiptap/extension/table.ts, backed by
 * @tiptap/extension-table's resizable TableView) renders a display-only
 * wrapper element `<div class="tableWrapper">` around the `<table>` that the
 * `table` document node actually corresponds to; the wrapper itself has no
 * representation in the round-tripped HTML.
 */
const isTableWrapperNodeView = (domNode: HTMLElement): boolean => {
  if (domNode.tagName !== "DIV") {
    return false;
  }
  const viewDesc = (domNode as DOMWithViewDesc).pmViewDesc;
  return viewDesc?.node?.type.name === "table";
};

const attrsToSelectorSuffix = (attrs: Record<string, string | undefined>): string =>
  (["id", "class", "style"] as const)
    .map((name) => (attrs[name] ? `[${name}="${attrs[name]}"]` : ""))
    .join("");

/**
 * Whether the node type manages the style attribute as its own dedicated node
 * attribute (see the Global extension's dedicatedAttributeNames) instead of
 * capturing it verbatim in MTRichTextEditorHTMLAttributes.
 */
const hasDedicatedStyleAttribute = (node: ProseMirrorNode): boolean =>
  Boolean(node.type.spec.attrs && "style" in node.type.spec.attrs);

/**
 * Composes the effective style string presented for a node: the declarations
 * backed by dedicated attributes (indent, textAlign and the table extensions'
 * style attribute) followed by the verbatim MTRichTextEditorHTMLAttributes
 * style. This is the inverse of the routing performed on modal submit.
 */
const buildEffectiveStyle = (node: ProseMirrorNode): string => {
  const declarations: string[] = [];
  if (node.attrs.indent) {
    declarations.push(`padding-left: ${node.attrs.indent}`);
  }
  if (node.attrs.textAlign) {
    declarations.push(`text-align: ${node.attrs.textAlign}`);
  }
  const verbatimStyle = hasDedicatedStyleAttribute(node)
    ? node.attrs.style
    : node.attrs.MTRichTextEditorHTMLAttributes?.style;
  if (verbatimStyle) {
    declarations.push(verbatimStyle);
  }
  return declarations.join("; ");
};

export class StructureMode {
  #editor: Editor;
  #onUpdateCallback: (event: EditorEvents["update"]) => void;
  #style: HTMLStyleElement;
  #clickCallback: (event: MouseEvent) => void;
  #modal: ReturnType<typeof mount> | null = null;
  #selector = "section, div:not(.ProseMirror-widget), p, ul, ol, li, h1, h2, h3, h4, h5, h6";

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

      const clickNode = this.#resolveNodeAtDom(domNode);
      if (!clickNode) {
        return;
      }

      const currentAttrs: Record<string, string | undefined> =
        clickNode.attrs.MTRichTextEditorHTMLAttributes ?? {};

      this.#modal = mount(StructureModal, {
        target: document.body,
        props: {
          structureData: {
            id: currentAttrs.id ?? "",
            className: currentAttrs.class ?? "",
            style: buildEffectiveStyle(clickNode),
          },
          onSubmit: (structureData: StructureData) => {
            const node = this.#resolveNodeAtDom(domNode);
            if (!node) {
              return;
            }
            const pos = this.#editor.tiptap.view.posAtDOM(domNode, 0) - 1;

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
            // Like padding-left / text-align above, the remaining style is routed
            // to the dedicated style attribute when the node type has one (see the
            // Global extension's dedicatedAttributeNames), and kept verbatim in
            // MTRichTextEditorHTMLAttributes otherwise.
            const remainingStyle =
              remainingDeclarations.length > 0 ? remainingDeclarations.join("; ") : undefined;
            newAttrs.style = hasDedicatedStyleAttribute(node) ? undefined : remainingStyle;

            let transaction = this.#editor.tiptap.state.tr.setNodeAttribute(
              pos,
              "MTRichTextEditorHTMLAttributes",
              newAttrs
            );
            if (hasDedicatedStyleAttribute(node)) {
              transaction = transaction.setNodeAttribute(pos, "style", remainingStyle);
            }
            if (hasIndentAttr) {
              transaction = transaction.setNodeAttribute(pos, "indent", indentValue);
            }
            if (hasTextAlignAttr) {
              transaction = transaction.setNodeAttribute(pos, "textAlign", textAlignValue ?? "");
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

  /**
   * Resolves the ProseMirror document node a structure-mode target DOM node corresponds to.
   */
  #resolveNodeAtDom(domNode: HTMLElement) {
    const pos = this.#editor.tiptap.view.posAtDOM(domNode, 0);
    return this.#editor.tiptap.state.doc.nodeAt(pos - 1);
  }

  #buildTableWrapperLabel(wrapperDomNode: HTMLElement): string {
    const tableNode = this.#resolveNodeAtDom(wrapperDomNode);
    if (!tableNode) {
      return "table";
    }
    const attrs: Record<string, string | undefined> = {
      ...tableNode.attrs.MTRichTextEditorHTMLAttributes,
    };
    attrs.style = buildEffectiveStyle(tableNode) || undefined;
    return `table${attrsToSelectorSuffix(attrs)}`;
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
      const isTableWrapper = isTableWrapperNodeView(domNode);
      const label = isTableWrapper ? this.#buildTableWrapperLabel(domNode) : selector;

      style += `${selector} {
    outline: 1px solid rgba(0, 0, 0, 0.2);
    padding: 0.5rem;
    margin: 1rem 0;
    border-radius: 0.5rem;
    position: relative;
    ${isTableWrapper ? "overflow: visible;" : ""}
    &:before {
      content: "${label.replace(/"/g, '\\"')}";
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
