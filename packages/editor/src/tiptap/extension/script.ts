import { Node } from "@tiptap/core";

export const Script = Node.create({
  name: "script",

  group: "inline",
  content: "text*",
  inline: true,
  atom: true,

  parseHTML() {
    return [
      {
        tag: "mt-rich-text-editor-script",
        preserveWhitespace: "full",
      },
    ];
  },

  addNodeView() {
    const allowedOrigins = ["https://gist.github.com"];

    // return ({ editor, node, getPos, HTMLAttributes, decorations, extension }) => {
    return ({ node }) => {
      const dom = document.createElement("div");
      dom.classList.add("mt-rich-text-editor-script");

      const attributes = node.attrs.MTRichTextEditorHTMLAttributes || {};

      dom.dataset.mtRichTextEditorScriptTitle =
        `<script ` +
        Object.entries(attributes)
          .map(([key, value]) => `${key}="${value}"`)
          .join(" ") +
        `/>`;

      const src = attributes.src;
      const srcOrigin =
        src &&
        (() => {
          try {
            return new URL(src).origin;
          } catch {
            return undefined;
          }
        })();

      if (srcOrigin && allowedOrigins.some((origin) => srcOrigin === origin)) {
        dom.classList.add("mt-rich-text-editor-script--preview");

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
        dom.appendChild(iframe);

        return {
          dom,
        };
      }

      dom.innerText = node.content.content
        .map((content) => content.text)
        .join("")
        .replace(/^\n/, "")
        .replace(/\s+$/, "");

      return {
        dom,
      };
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ["mt-rich-text-editor-script", HTMLAttributes, 0];
  },
});
