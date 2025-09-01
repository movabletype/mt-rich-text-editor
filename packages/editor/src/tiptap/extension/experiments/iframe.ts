import { Node } from "@tiptap/core";
import { isSameOrigin } from "../../../util/dom";

export default Node.create({
  name: "iframe",
  group: "inline",
  content: "text*",
  inline: true,
  atom: true,

  parseHTML() {
    return [
      {
        tag: "iframe",
      },
    ];
  },

  addNodeView() {
    return ({ node }) => {
      let { MTRichTextEditorHTMLAttributes: attributes } = node.attrs;
      if (isSameOrigin(attributes)) {
        const sandbox = attributes.sandbox
          ? attributes.sandbox
              .split(/\s+/)
              .filter((value: string) => !/allow-same-origin/i.test(value))
              .join(" ")
          : "allow-scripts";
        attributes = {
          ...attributes,
          sandbox,
        };
      }

      const dom = document.createElement("iframe");
      for (const key in attributes) {
        dom.setAttribute(key, attributes[key]);
      }
      return {
        dom,
      };
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ["iframe", HTMLAttributes];
  },
});
