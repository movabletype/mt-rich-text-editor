import { Extension } from "@tiptap/core";

export interface GlobalOptions {
  additionalGlobalAttributeTypes: string[];
  // Node type name -> list of CSS style properties that must be stripped out of the
  // verbatim-preserved style string because a dedicated extension (e.g. indent,
  // textAlign) already manages that property on its own attribute.
  excludedStyleProperties: Record<string, string[]>;
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

const removeStyleProperties = (style: string, properties: string[]): string => {
  const excluded = new Set(properties.map((property) => property.toLowerCase()));

  return style
    .split(";")
    .map((declaration) => declaration.trim())
    .filter((declaration) => {
      const [property] = declaration.split(":", 1);
      return property && !excluded.has(property.trim().toLowerCase());
    })
    .join("; ");
};

const parseHTMLAttributes = (
  element: HTMLElement,
  excludedStyleProperties: string[] = []
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
    if (excludedStyleProperties.length > 0 && attr.name.toLowerCase() === "style") {
      const style = removeStyleProperties(attr.value, excludedStyleProperties);
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
      excludedStyleProperties: {},
    };
  },

  addGlobalAttributes() {
    const types = [
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
      "textStyle",
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
    ].concat(this.options.additionalGlobalAttributeTypes);

    // Group types by their (sorted) set of excluded style properties so that types
    // sharing the same exclusion set can reuse a single global attribute definition,
    // while types with no exclusions keep the original verbatim behavior.
    const groups = new Map<string, string[]>();
    for (const type of types) {
      const excludedStyleProperties = [
        ...(this.options.excludedStyleProperties[type] ?? []),
      ].sort();
      const key = excludedStyleProperties.join(",");
      const group = groups.get(key);
      if (group) {
        group.push(type);
      } else {
        groups.set(key, [type]);
      }
    }

    return [...groups.entries()].map(([key, groupTypes]) => {
      const excludedStyleProperties = key ? key.split(",") : [];
      return {
        types: groupTypes,
        attributes: {
          MTRichTextEditorHTMLAttributes: {
            default: {},
            parseHTML: (element: HTMLElement) =>
              parseHTMLAttributes(element, excludedStyleProperties),
            renderHTML: (attributes) => attributes.MTRichTextEditorHTMLAttributes,
          },
        },
      };
    });
  },
});
