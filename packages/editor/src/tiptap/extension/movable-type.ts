import { Node, mergeAttributes, InputRule } from "@tiptap/core";

window.customElements.define(
  "mt-rich-text-editor-mt-function-tag",
  class extends HTMLElement {
    connectedCallback() {
      this.style.color = "#9333ea";
      this.style.fontFamily = "monospace";

      const ignoreAttributes = ["data-tag-name", "contenteditable", "style", "class"];

      const tagName = this.getAttribute("data-tag-name");
      if (!tagName) {
        return;
      }

      let attributesStr = "";
      Array.from(this.attributes)
        .filter((attr) => !ignoreAttributes.includes(attr.name))
        .forEach((attr) => {
          attributesStr += ` ${attr.name}="${attr.value}"`;
        });

      this.textContent = `<mt:${tagName}${attributesStr}>`;
    }
  }
);

export const MovableType = Node.create({
  name: "mt-rich-text-editor-mt-function-tag",

  group: "inline",
  inline: true,
  atom: true,

  addGlobalAttributes() {
    return [
      {
        types: ["hardBreak"],
        attributes: {
          HTMLAttributes: {
            default: {},
            parseHTML: (element: HTMLElement) => {
              console.log(element);
              const attrs: Record<string, string> = {};
              for (const attr of element.attributes) {
                attrs[attr.name] = attr.value;
              }
              return attrs;
            },
            renderHTML: (attributes: Record<string, string>) => attributes.HTMLAttributes,
          },
        },
      },
    ];
  },

  addAttributes() {
    return {
      "data-tag-name": {
        default: null,
      },
      HTMLAttributes: {
        default: {},
        parseHTML: (element) => {
          const attrs: Record<string, string> = {};
          const ignoreAttributes = ["data-tag-name", "contenteditable", "style", "class"];

          Array.from(element.attributes)
            .filter((attr) => !ignoreAttributes.includes(attr.name))
            .forEach((attr) => {
              attrs[attr.name] = attr.value;
            });

          return attrs;
        },
        renderHTML: (attributes) => attributes.HTMLAttributes,
      },
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: /<\$?mt:?(var|include)([^>]*)\$?>$/i,
        handler: ({ state, range, match }) => {
          const parser = new DOMParser();
          const element = parser.parseFromString(
            match[0].replace(/^<\$/, "<").replace(/\$>$/, ">"),
            "text/html"
          ).body.firstChild as HTMLElement;

          const attrs: Record<string, any> = {
            "data-tag-name": match[1],
            HTMLAttributes: {},
          };

          for (const attr of element.attributes) {
            if (attr.name !== "data-tag-name") {
              attrs.HTMLAttributes[attr.name] = attr.value;
            }
          }

          const node = this.type.create(attrs);
          state.tr.replaceWith(range.from, range.to, node);
        },
      }),
    ];
  },

  parseHTML() {
    return [
      {
        tag: "mt-rich-text-editor-mt-function-tag",
        getAttrs: (node: HTMLElement) => {
          if (!(node instanceof HTMLElement)) {
            return {};
          }
          return {
            "data-tag-name": node.getAttribute("data-tag-name"),
            ...Object.fromEntries(
              Array.from(node.attributes)
                .filter((attr) => attr.name !== "data-tag-name")
                .map((attr) => [attr.name, attr.value])
            ),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["mt-rich-text-editor-mt-function-tag", mergeAttributes(HTMLAttributes)];
  },
});
