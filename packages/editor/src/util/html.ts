const isEditable = (element: HTMLElement): boolean =>
  !element.closest("div[data-mt-rich-text-editor-embed-object]");

const isInlineNode = (node: Node, inlineElementSet: Set<string>): boolean =>
  !(
    // a[data-mt-rich-text-editor-block="true"] should be treated as block element even if it contains text nodes or images
    (node instanceof HTMLElement && node.dataset.mtRichTextEditorBlock === "true")
  ) &&
  (node.nodeType === Node.TEXT_NODE ||
    (node.nodeType === Node.ELEMENT_NODE && inlineElementSet.has(node.nodeName)));

export const preprocessHTML = (
  html: string,
  blockElements: string[],
  inlineElements: string[]
): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${html}</body>`, "text/html");
  const body = doc.body;
  const blockElementSelector = blockElements.join(",");
  const inlineElementSet = new Set(inlineElements.map((el) => el.toUpperCase()));
  if (inlineElementSet.has("SCRIPT")) {
    inlineElementSet.add("MT-RICH-TEXT-EDITOR-SCRIPT");
  }

  body.querySelectorAll("a").forEach((a) => {
    if (!isEditable(a)) {
      return;
    }

    if (
      a.querySelector(
        "blockquote, div, dl, h1, h2, h3, h4, h5, h6, hr, ol, p, pre, table, td, thead, tr, ul," +
          blockElementSelector
      )
    ) {
      a.dataset.mtRichTextEditorBlock = "true";
    }
  });

  body.querySelectorAll("script").forEach((script) => {
    if (!isEditable(script)) {
      return;
    }

    const element = document.createElement("mt-rich-text-editor-script");
    element.textContent = script.textContent;
    Array.from(script.attributes).forEach((attr) => {
      element.setAttribute(attr.name, attr.value);
    });
    script.parentNode?.replaceChild(element, script);
  });

  body
    .querySelectorAll<HTMLElement>("div, blockquote, ul, ol, td, th," + blockElementSelector)
    .forEach((div) => {
      if (!isEditable(div)) {
        return;
      }

      const hasDirectInlineNode = Array.from(div.childNodes).some((node) =>
        isInlineNode(node, inlineElementSet)
      );
      if (hasDirectInlineNode) {
        const encoder = document.createElement("div");

        for (let i = 0; i < div.childNodes.length; i++) {
          const headChild = div.childNodes[i];
          if (isInlineNode(headChild, inlineElementSet)) {
            const textBlock = document.createElement("mt-text-block");
            let content = "";
            while (i < div.childNodes.length) {
              const child = div.childNodes[i];
              if (child.nodeType === Node.TEXT_NODE) {
                encoder.textContent = child.textContent;
                content += encoder.innerHTML;
              } else if (child instanceof HTMLElement && inlineElementSet.has(child.nodeName)) {
                content += child.outerHTML;
              } else {
                break;
              }
              child.remove();
            }
            div.insertBefore(textBlock, div.childNodes[i]);
            textBlock.innerHTML = content;
            i--;
          }
        }
      }
    });

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

export const cssSize = (value: string): string => {
  if (value !== "0" && /^-?(\d+|\d*\.\d+)$/.test(value)) {
    return `${value}px`;
  }
  return value;
};
