import { Node } from "@tiptap/core";

export interface ScriptOptions {
  allowedOrigins?: string[];
}

const getOrigin = (src: string | undefined) => {
  if (!src) {
    return undefined;
  }
  const anchor = document.createElement("a");
  anchor.href = src;
  return anchor.origin;
};

export const Script = Node.create<ScriptOptions>({
  name: "script",

  group: "inline",
  content: "text*",
  inline: true,
  atom: true,

  addOptions() {
    return {
      allowedOrigins: ["https://gist.github.com", "https://pastebin.com"],
    };
  },

  parseHTML() {
    return [
      {
        tag: "mt-rich-text-editor-script",
        preserveWhitespace: "full",
      },
    ];
  },

  addNodeView() {
    const allowedOrigins = this.options.allowedOrigins || [];

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
      const srcOrigin = getOrigin(src);

      if (srcOrigin && allowedOrigins.includes(srcOrigin)) {
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
