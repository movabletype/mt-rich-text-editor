import toolbar from "../../toolbar/item";

import "../quick-action/Heading1.svelte";
import "../quick-action/Heading2.svelte";
import "../quick-action/Heading3.svelte";
import "../quick-action/Heading4.svelte";
import "../quick-action/Heading5.svelte";
import "../quick-action/Heading6.svelte";

import "../paste/Html.svelte";
import "../paste/Link.svelte";
import "../paste/Embed.svelte";
import "../paste/EmbedInline.svelte";
import "../paste/Markdown.svelte";

import { StatusbarItemElement, PasteMenuItemElement } from "./element";

type PanelNamespace = "toolbar" | "statusbar" | "paste-menu" | "quick-action";

export class PathItem<
  Options extends Record<string, any> = Record<string, any>,
> extends StatusbarItemElement<Options> {
  onEditorUpdate() {
    if (!this.tiptap) {
      return;
    }

    const { selection } = this.tiptap.state;
    const $head = selection.$head;

    const path: string[] = [];
    for (let depth = 1; depth <= $head.depth; depth++) {
      const node = $head.node(depth);
      let nodeName = this.getHTMLTag(node.type.name);
      if (!nodeName) {
        continue;
      }

      const textAlign = node.attrs.textAlign;
      if (textAlign) {
        nodeName += `[align=${textAlign}]`;
      }

      path.push(nodeName);
    }

    this.shadowRoot.textContent = path.join(" > ");
  }

  private getHTMLTag(nodeName: string): string {
    const nodeToTagMap: Record<string, string> = {
      paragraph: "p",
      heading: "h1",
      bulletList: "ul",
      orderedList: "ol",
      listItem: "li",
      blockquote: "blockquote",
      horizontalRule: "hr",
      table: "table",
      tableRow: "tr",
      tableCell: "td",
      tableHeader: "th",
      hardBreak: "br",
      text: "",
      textBlock: "",
    };

    return nodeToTagMap[nodeName] ?? nodeName;
  }
}

export class AsText extends PasteMenuItemElement {
  constructor() {
    super();
    this.shadowRoot.innerHTML = "テキストとして貼り付け";
  }

  onEditorPaste() {
    const encoder = document.createElement("div");
    encoder.textContent = this.content?.plainText ?? "";
    this.insertPasteContent(encoder.innerHTML.replace(/\n/g, "<br>"));
    // TBD: enclose with <p> tag
    // this.insertPasteContent(preprocessHTML(`<p>${encoder.innerHTML}</p>`));
  }
}

const systemItems: Record<PanelNamespace, Record<string, typeof HTMLElement>> = {
  toolbar,
  statusbar: {
    path: PathItem,
  },
  "paste-menu": {
    text: AsText,
  },
  "quick-action": {},
};

export const getPanelItem = (namespace: PanelNamespace, name: string): string | undefined => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("-") && window.customElements.get(lowerName)) {
    // specified by full name
    return lowerName;
  }

  const elementName = `mt-rich-text-editor-${namespace}-item-${lowerName}`;
  let elementConstructor = window.customElements.get(elementName);
  if (!elementConstructor) {
    elementConstructor = systemItems[namespace][name];
    if (!elementConstructor) {
      console.error(`Item for ${name} is not found`);
      return undefined;
    }
    window.customElements.define(elementName, elementConstructor);
  }
  return elementName;
};
