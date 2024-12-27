export function preprocessHTML(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${html}</body>`, "text/html");
  const body = doc.body;

  body.querySelectorAll("a").forEach((a) => {
    if (a.querySelector("div")) {
      a.dataset.block = "true";
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

  body.querySelectorAll("div, blockquote, main, article").forEach((div) => {
    const hasDirectTextNode = Array.from(div.childNodes).some(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
    );

    if (hasDirectTextNode) {
      const textBlock = document.createElement("mt-text-block");
      let content = "";

      const nodesToProcess = Array.from(div.childNodes).filter(
        (node) =>
          node.nodeType === Node.TEXT_NODE ||
          (node.nodeType === Node.ELEMENT_NODE && node.nodeName === "BR")
      );

      nodesToProcess.forEach((node, index) => {
        if (node.nodeType === Node.TEXT_NODE) {
          content += node.textContent;
        } else if (node.nodeName === "BR") {
          content += "<br>";
        }
      });

      textBlock.textContent = content;

      nodesToProcess.forEach((node) => node.remove());

      div.appendChild(textBlock);
    }
  });

  body.querySelectorAll("td, th").forEach((td) => {
    if (td.childNodes.length === 0) {
      td.appendChild(document.createElement("mt-text-block"));
    }
  });

  return body.innerHTML;
}

export function normalizeHTML(html: string): string {
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

  return doc.body.innerHTML;
}
