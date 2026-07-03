import { Extension } from "@tiptap/core";

export interface GlobalOptions {
  additionalGlobalAttributeTypes: string[];
}

const eventAttrNames = new Set([
  "onabortonblur",
  "oncancel",
  "oncanplay",
  "oncanplaythrough",
  "onchange",
  "onclick",
  "onclose",
  "oncontextmenu",
  "oncuechange",
  "ondblclick",
  "ondrag",
  "ondragend",
  "ondragenter",
  "ondragleave",
  "ondragover",
  "ondragstart",
  "ondrop",
  "ondurationchange",
  "onemptied",
  "onended",
  "onerror",
  "onfocus",
  "oninput",
  "oninvalid",
  "onkeydown",
  "onkeypress",
  "onkeyup",
  "onload",
  "onloadeddata",
  "onloadedmetadata",
  "onloadstart",
  "onmousedown",
  "onmousemove",
  "onmouseout",
  "onmouseover",
  "onmouseup",
  "onmousewheel",
  "onpause",
  "onplay",
  "onplaying",
  "onprogress",
  "onratechange",
  "onreset",
  "onscroll",
  "onseeked",
  "onseeking",
  "onseeking",
  "onselect",
  "onshow",
  "onstalled",
  "onsubmit",
  "onsuspend",
  "ontimeupdate",
  "onvolumechange",
  "onwaiting",
  "formaction",
  "action",
]);

const textStyleProperties = new Set(["color", "background-color"]);

const removeTextStyleProperties = (style: string): string => {
  return style
    .split(";")
    .map((declaration) => declaration.trim())
    .filter((declaration) => {
      const [property] = declaration.split(":", 1);
      return property && !textStyleProperties.has(property.trim().toLowerCase());
    })
    .join("; ");
};

const parseHTMLAttributes = (
  element: HTMLElement,
  options: { removeTextStyleProperties?: boolean } = {}
): Record<string, string> => {
  const attrs: Record<string, string> = {};
  const eventAttrs: Record<string, string> = {};

  for (const attr of element.attributes) {
    if (/^data-mt-rich-text-editor-/.test(attr.name)) {
      continue;
    }

    if (eventAttrNames.has(attr.name.toLowerCase())) {
      eventAttrs[attr.name] = attr.value;
      continue;
    }

    if (options.removeTextStyleProperties && attr.name.toLowerCase() === "style") {
      const style = removeTextStyleProperties(attr.value);
      if (style) {
        attrs[attr.name] = style;
      }
      continue;
    }

    attrs[attr.name] = attr.value;
  }

  if (Object.keys(eventAttrs).length > 0) {
    attrs["data-mt-rich-text-editor-event-attributes"] = JSON.stringify(eventAttrs);
  }

  return attrs;
};

export const Global = Extension.create<GlobalOptions>({
  name: "mt-rich-text-editor-global",

  addOptions() {
    return {
      additionalGlobalAttributeTypes: [],
    };
  },

  addGlobalAttributes() {
    const additionalTypes = this.options.additionalGlobalAttributeTypes.filter(
      (type) => type !== "textStyle"
    );

    return [
      {
        types: [
          "div",
          "pre",
          "code",
          "blockquote",
          "bulletList",
          "document",
          "embedObject",
          "hardBreak",
          "heading",
          "horizontalRule",
          "iframe",
          "image",
          "inlineLink",
          "listItem",
          "orderedList",
          "paragraph",
          "script",
          "svg",
          "table",
          "tableRow",
          "tableCell",
          "tableHeader",
          "link",
          "blockLink",
          "descriptionList",
          "descriptionTerm",
          "descriptionDetails",
        ].concat(additionalTypes),
        attributes: {
          MTRichTextEditorHTMLAttributes: {
            default: {},
            parseHTML: (element: HTMLElement) => parseHTMLAttributes(element),
            renderHTML: (attributes) => attributes.MTRichTextEditorHTMLAttributes,
          },
        },
      },
      {
        types: ["textStyle"],
        attributes: {
          MTRichTextEditorHTMLAttributes: {
            default: {},
            parseHTML: (element: HTMLElement) =>
              parseHTMLAttributes(element, { removeTextStyleProperties: true }),
            renderHTML: (attributes) => attributes.MTRichTextEditorHTMLAttributes,
          },
        },
      },
    ];
  },
});
