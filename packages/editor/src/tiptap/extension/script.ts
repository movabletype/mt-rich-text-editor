import { Node, mergeAttributes } from "@tiptap/core";

window.customElements.define(
  "mt-rich-text-editor-script",
  class extends HTMLElement {
    connectedCallback() {
      const allowedOrigins = ["https://gist.github.com"];
      const src = this.getAttribute("src");
      if (src && allowedOrigins.some((origin) => src.startsWith(`${origin}/`))) {
        const iframe = document.createElement("iframe");
        iframe.style.width = "100%";
        iframe.style.border = "none";

        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                html, body {
                  margin: 0;
                  padding: 0;
                  overflow: hidden;
                }
                ::-webkit-scrollbar {
                  display: none;
                }
              </style>
              <script>
                const resizeObserver = new ResizeObserver((entries) => {
                  const height = document.body.scrollHeight;
                  window.frameElement.style.height = \`\${height}px\`;
                });
                
                window.addEventListener('load', () => {
                  resizeObserver.observe(document.body);
                });

                const events = ['mousedown', 'mouseup', 'click', 'dblclick', 'contextmenu', 'mousemove'];
                events.forEach(eventName => {
                  document.addEventListener(eventName, (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    window.frameElement.click();
                  }, true);
                });
              </script>
              <script src="${src}"></script>
            </head>
            <body></body>
          </html>
        `;
        iframe.srcdoc = html;

        this.appendChild(iframe);
      }
    }
  }
);

export const Script = Node.create({
  name: "mt-rich-text-editor-script",

  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
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

  parseHTML() {
    return [
      {
        tag: "mt-rich-text-editor-script",
        getAttrs: (node: HTMLElement) => {
          if (!(node instanceof HTMLElement)) {
            return {};
          }
          return Object.fromEntries(
            Array.from(node.attributes).map((attr) => [attr.name, attr.value])
          );
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["mt-rich-text-editor-script", mergeAttributes(HTMLAttributes)];
  },
});
