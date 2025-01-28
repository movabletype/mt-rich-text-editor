import { StatusbarItemElement } from "./element";

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
const getHTMLTag = (nodeName: string): string => nodeToTagMap[nodeName] ?? nodeName;

class PathItem<
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
      let nodeName = getHTMLTag(node.type.name);
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
}

export default {
  path: PathItem,
};
