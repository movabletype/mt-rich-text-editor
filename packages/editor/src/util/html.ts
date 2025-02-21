export const preprocessHTML = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${html}</body>`, "text/html");
  const body = doc.body;

  body.querySelectorAll("a").forEach((a) => {
    if (
      a.querySelector(
        "address, article, aside, blockquote, details, dialog, div, dl, figure, footer, header, h1, h2, h3, h4, h5, h6, hr, main, nav, ol, p, pre, section, table, td, thead, tr, ul"
      )
    ) {
      a.dataset.mtRichTextEditorBlock = "true";
    }
  });

  body.querySelectorAll("script").forEach((script) => {
    const element = document.createElement("mt-rich-text-editor-script");
    element.textContent = script.textContent;
    Array.from(script.attributes).forEach((attr) => {
      element.setAttribute(attr.name, attr.value);
    });
    script.parentNode?.replaceChild(element, script);
  });

  body
    .querySelectorAll(
      "div, blockquote, main, article, ul, ol, section, aside, nav, header, footer, figure, details, dialog"
    )
    .forEach((div) => {
      const hasDirectTextNode = Array.from(div.childNodes).some(
        (node) =>
          node instanceof HTMLImageElement ||
          (node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
      );

      if (hasDirectTextNode) {
        const textBlock = document.createElement("mt-text-block");
        let content = "";

        const nodesToProcess = Array.from(div.childNodes).filter(
          (node) =>
            node instanceof HTMLImageElement ||
            node.nodeType === Node.TEXT_NODE ||
            (node.nodeType === Node.ELEMENT_NODE && node.nodeName === "BR")
        );

        const encoder = document.createElement("div");
        nodesToProcess.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            encoder.textContent = node.textContent;
            content += encoder.innerHTML;
          } else if (node.nodeName === "BR") {
            content += "<br>";
          } else if (node instanceof HTMLImageElement) {
            content += node.outerHTML;
          }
        });

        textBlock.innerHTML = content;

        nodesToProcess.forEach((node) => node.remove());

        div.appendChild(textBlock);
      }
    });

  // body.querySelectorAll("td, th").forEach((td) => {
  //   if (td.childNodes.length === 0) {
  //     td.appendChild(document.createElement("mt-text-block"));
  //   }
  // });

  return body.innerHTML;
};

export const normalizeHTML = (html: string): string => {
  if (/^<p[^>]*><\/p>$/i.test(html)) {
    return "";
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  doc.body.querySelectorAll("mt-text-block").forEach((textBlock) => {
    const parent = textBlock.parentNode;
    if (!parent) return;

    while (textBlock.firstChild) {
      parent.insertBefore(textBlock.firstChild, textBlock);
    }
    textBlock.remove();
  });

  doc.body.querySelectorAll(`[textalign=""]`).forEach((element) => {
    element.removeAttribute("textalign");
  });

  doc.body.querySelectorAll(`[data-mt-indent]`).forEach((element) => {
    element.removeAttribute("data-mt-indent");
  });

  doc.body
    .querySelectorAll<HTMLElement>(`[data-mt-rich-text-editor-event-attributes]`)
    .forEach((element) => {
      const eventAttrs = JSON.parse(
        element.dataset.mtRichTextEditorEventAttributes ?? "{}"
      ) as Record<string, string>;
      Object.entries(eventAttrs).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
      element.removeAttribute("data-mt-rich-text-editor-event-attributes");
    });

  doc.body
    .querySelectorAll<HTMLElement>(`[data-mt-rich-text-editor-content]`)
    .forEach((element) => {
      element.innerHTML = element.getAttribute("data-mt-rich-text-editor-content") ?? "";
      element.removeAttribute("data-mt-rich-text-editor-content");
    });

  doc.body.querySelectorAll("mt-rich-text-editor-script").forEach((script) => {
    const element = document.createElement("script");
    element.textContent = script.textContent;
    Array.from(script.attributes).forEach((attr) => {
      element.setAttribute(attr.name, attr.value);
    });
    script.parentNode?.replaceChild(element, script);
  });

  const res = doc.body.innerHTML;
  if (/^<p[^>]*><\/p>$/i.test(res)) {
    return "";
  }
  return res;
};
