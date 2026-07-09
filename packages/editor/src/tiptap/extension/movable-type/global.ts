import { Extension } from "@tiptap/core";
import type { Attribute } from "@tiptap/core";

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

/**
 * Builds the value stored in the MTRichTextEditorHTMLAttributes global attribute from a plain HTML attribute record.
 */
export const buildMTRichTextEditorHTMLAttributes = (
  attributes: Record<string, string>
): Record<string, string> => {
  const attrs: Record<string, string> = {};
  const eventAttrs: Record<string, string> = {};
  for (const [name, value] of Object.entries(attributes)) {
    if (/^data-mt-rich-text-editor-/i.test(name)) {
      continue;
    }
    if (eventAttrNames.has(name.toLowerCase())) {
      eventAttrs[name] = value;
    } else {
      attrs[name] = value;
    }
  }

  if (Object.keys(eventAttrs).length > 0) {
    attrs["data-mt-rich-text-editor-event-attributes"] = JSON.stringify(eventAttrs);
  }
  return attrs;
};

const removeStyleProperties = (style: string, properties: readonly string[]): string => {
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

// Attribute names that a dedicated node attribute already manages (see
// tiptap/extension/table.ts, table-cell.ts and table-header.ts), keyed by node
// type. They must stay out of the verbatim MTRichTextEditorHTMLAttributes
// capture, otherwise the two copies drift out of sync.
const dedicatedAttributeNames: Record<string, string[]> = {
  table: ["style"],
  tableCell: ["style"],
  tableHeader: ["style", "scope"],
};

const createGlobalAttribute = (
  excludeAttributeNames: readonly string[] = [],
  excludedStyleProperties: readonly string[] = []
): Attribute => ({
  default: {},
  parseHTML: (element: HTMLElement) => {
    const attributes: Record<string, string> = {};
    for (const attr of element.attributes) {
      if (excludeAttributeNames.includes(attr.name)) {
        continue;
      }
      if (excludedStyleProperties.length > 0 && attr.name.toLowerCase() === "style") {
        const style = removeStyleProperties(attr.value, excludedStyleProperties);
        if (style) {
          attributes[attr.name] = style;
        }
        continue;
      }
      attributes[attr.name] = attr.value;
    }
    return buildMTRichTextEditorHTMLAttributes(attributes);
  },
  renderHTML: (attributes) => attributes.MTRichTextEditorHTMLAttributes,
});

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

    // Group types by their set of excluded attribute names and (sorted) excluded
    // style properties so that types sharing the same exclusions can reuse a single
    // global attribute definition, while types with no exclusions keep the original
    // verbatim behavior.
    const groups = new Map<
      string,
      { types: string[]; excludeAttributeNames: string[]; excludedStyleProperties: string[] }
    >();
    for (const type of types) {
      const excludeAttributeNames = dedicatedAttributeNames[type] ?? [];
      const excludedStyleProperties = [
        ...(this.options.excludedStyleProperties[type] ?? []),
      ].sort();
      const key = JSON.stringify([excludeAttributeNames, excludedStyleProperties]);
      const group = groups.get(key);
      if (group) {
        group.types.push(type);
      } else {
        groups.set(key, { types: [type], excludeAttributeNames, excludedStyleProperties });
      }
    }

    return [...groups.values()].map(
      ({ types: groupTypes, excludeAttributeNames, excludedStyleProperties }) => ({
        types: groupTypes,
        attributes: {
          MTRichTextEditorHTMLAttributes: createGlobalAttribute(
            excludeAttributeNames,
            excludedStyleProperties
          ),
        },
      })
    );
  },
});
