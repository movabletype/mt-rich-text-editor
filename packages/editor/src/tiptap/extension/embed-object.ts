import { Node, mergeAttributes } from "@tiptap/core";

interface EmbedData {
  url: string;
  maxwidth?: number;
  maxheight?: number;
}

export interface EmbedObjectOptions {
  HTMLAttributes: Record<string, any>;
  resolver: (params: EmbedData) => Promise<{ html: string }>;
}

declare module "@tiptap/core" {
  interface Commands {
    embedObject: {
      getEmbedObject: (attributes: EmbedData) => Promise<{ html: string; inline?: string }>;
      insertEmbedObject: (html: string) => void;
    };
  }
}

export const EmbedObject = Node.create<EmbedObjectOptions>({
  name: "embedObject",
  priority: 1000,
  group: "block",
  content: "block*",
  defining: true,

  addAttributes() {
    return {
      "data-mt-rich-text-editor-block": {
        default: null,
        renderHTML: () => null,
      },
      content: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "mt-rich-text-editor-embed-object",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) {
            return false;
          }

          return {
            href: element.getAttribute("href"),
            "data-mt-rich-text-editor-block": element.getAttribute("data-mt-rich-text-editor-block"),
            content: element.getAttribute("data-mt-rich-text-editor-content") || element.innerHTML,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["mt-rich-text-editor-embed-object", mergeAttributes(this.options.HTMLAttributes, { "data-mt-rich-text-editor-content": HTMLAttributes.content }), 0];
  },

  addNodeView() {
    return ({node}) => {
      const iframe = document.createElement('iframe')
      iframe.setAttribute('frameborder', '0')
      iframe.setAttribute('allowfullscreen', 'true')
      iframe.style.width = '100%'

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
              const width = document.body.scrollWidth;
              window.frameElement.style.height = \`\${height}px\`;
              window.frameElement.style.width = \`\${width}px\`;
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
        </head>
        <body>
          ${node.attrs.content}
        </body>
      </html>
    `;

      iframe.srcdoc = html
      
      return {
        dom: iframe,
        update: (node) => {
          // // Update iframe content when node changes
          // const content = node.content.content[0]?.content?.toString() || ''
          
          // iframe.contentDocument?.open()
          // iframe.contentDocument?.write(content)
          // iframe.contentDocument?.close()
          
          return true
        }
      }
    }
  },

  addCommands() {
    return {
      getEmbedObject: (embedData: EmbedData) =>
        (() => {
          return this.options.resolver(embedData);
        }) as any,
      insertEmbedObject: (html: string) => {
        const { state } = this.editor;
        const pos = state.selection.$anchor.pos;

        // Insert the embed object
        this.editor.commands.insertContent({
          type: this.name,
          attrs: {
            content: html,
          },
        });

        // Move cursor after the inserted node
        this.editor.commands.setTextSelection(pos + 2);

        return true;
      },
    };
  },
});
