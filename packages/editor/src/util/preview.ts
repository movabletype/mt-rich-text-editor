import type { Editor as TiptapEditor } from "@tiptap/core";

type Message =
  | {
      method: "click";
      id: string;
    }
  | {
      method: "resize";
      id: string;
      width: number;
      height: number;
    };

const postMessageHandlers: Record<string, (ev: MessageEvent<Message>) => void> = {};
const createPostMessageHandler = (editor: TiptapEditor) => {
  const uniqueId = Math.random().toString(36).substring(2, 15);
  const container: HTMLElement = editor.view.dom;
  const handler = (ev: MessageEvent<Message>) => {
    const iframe = container.querySelector<HTMLIFrameElement>(
      `iframe[data-mt-rich-text-editor-iframe="${uniqueId}"]`
    );
    if (!iframe) {
      return;
    }
    const message = ev.data;
    if (message.method === "click") {
      iframe.click();
    } else if (message.method === "resize") {
      if (message.width) {
        iframe.style.width = `${message.width}px`;
      }
      if (message.height) {
        iframe.style.height = `${message.height}px`;
      }
    }
  };

  postMessageHandlers[uniqueId] = handler;
  window.addEventListener("message", handler, {
    capture: true,
    passive: true,
  });

  return {
    id: uniqueId,
    handler,
  };
};

const destroyPostMessageHandler = (id: string) => {
  const handler = postMessageHandlers[id];
  if (handler) {
    window.removeEventListener("message", handler, {
      capture: true,
    });
    delete postMessageHandlers[id];
  }
};

export const createPreviewIframe = (editor: TiptapEditor, content: string): HTMLIFrameElement => {
  const { id } = createPostMessageHandler(editor);

  const options: Parameters<typeof editor.commands.emitEditorEvent<"previewIframe">>[1] = {
    sourceType: "data",
    content,
    sandbox: "allow-scripts allow-same-origin",
  };
  editor.commands.emitEditorEvent("previewIframe", options);

  const wrap = options.sourceType === "data-wrap";

  const iframe = document.createElement("iframe");
  iframe.setAttribute("data-mt-rich-text-editor-iframe", id);
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("allowfullscreen", "true");
  iframe.style.width = "100%";
  iframe.style.display = "block";
  iframe.sandbox = options.sandbox;

  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="${document.characterSet || "UTF-8"}">
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
              window.parent.postMessage({
                method: "resize",
                id: "${id}",
                width: document.body.scrollWidth,
                height: document.body.scrollHeight,
              }, "*");
            });
            
            window.addEventListener('load', () => {
              resizeObserver.observe(document.body);
            });

            const events = ['mousedown', 'mouseup', 'click', 'dblclick', 'contextmenu', 'mousemove'];
            events.forEach(eventName => {
              document.addEventListener(eventName, (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (eventName === "click") {
                  window.parent.postMessage({
                    method: eventName,
                    id: "${id}",
                  }, "*");
                }
              }, true);
            });
          </script>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `;

  const data = new TextEncoder().encode(html);
  const base64Html = btoa(String.fromCharCode(...data));
  iframe.src = `data:text/html;base64,${base64Html}`;

  return iframe;
};

export const destroyPreviewIframe = (iframe: HTMLIFrameElement) => {
  destroyPostMessageHandler(iframe.getAttribute("data-mt-rich-text-editor-iframe") || "");
};
