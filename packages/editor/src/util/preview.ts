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
  const handler = (ev: MessageEvent<Message>) => {
    const message = ev.data;
    if (message?.id !== uniqueId) {
      return;
    }
    const iframe = editor.view.dom.querySelector<HTMLIFrameElement>(
      `iframe[data-mt-rich-text-editor-iframe="${message.id}"]`
    );
    if (!iframe) {
      return;
    }
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

  let html = `
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
            const wrap = ${wrap ? "true" : "false"};
            const parentWindow = wrap ? window.parent.parent : window.parent;

            const resizeObserver = new ResizeObserver((entries) => {
              const width = document.body.scrollWidth;
              const height = document.body.scrollHeight;

              parentWindow.postMessage({
                method: "resize",
                id: "${id}",
                width: width,
                height: height,
              }, "*");

              if (wrap) {
                window.frameElement.style.width = width + "px";
                window.frameElement.style.height = height + "px";
              }
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
                  parentWindow.postMessage({
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

  if (options.sourceType === "data" || options.sourceType === "data-wrap") {
    if (options.sourceType === "data-wrap") {
      const iframe = document.createElement("iframe");
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("allowfullscreen", "true");
      iframe.srcdoc = html;
      html = `
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
            iframe {
              width: 100%;
              display: block;
            }
            ::-webkit-scrollbar {
              display: none;
            }
          </style>
        </head>
        <body>
          ${iframe.outerHTML}
        </body>
      </html>
      `;
    }
    const data = new TextEncoder().encode(html);
    const base64Html = btoa(String.fromCharCode(...data));
    iframe.src = `data:text/html;base64,${base64Html}`;
  } else if (options.sourceType === "blob") {
    iframe.src = URL.createObjectURL(
      new Blob([html], {
        type: "text/html",
      })
    );
  } else if (options.sourceType === "srcdoc") {
    iframe.srcdoc = html;
  }

  return iframe;
};

export const destroyPreviewIframe = (iframe: HTMLIFrameElement) => {
  destroyPostMessageHandler(iframe.getAttribute("data-mt-rich-text-editor-iframe") || "");
};
