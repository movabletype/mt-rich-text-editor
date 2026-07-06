import { Extension } from "@tiptap/core";
import type { Attribute } from "@tiptap/core";

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

const createGlobalAttribute = (excludeAttributeNames: readonly string[] = []): Attribute => ({
  default: {},
  parseHTML: (element: HTMLElement) =>
    buildMTRichTextEditorHTMLAttributes(
      Object.fromEntries(
        Array.from(element.attributes, (attr) => [attr.name, attr.value]).filter(
          ([name]) => !excludeAttributeNames.includes(name)
        )
      )
    ),
  renderHTML: (attributes) => attributes.MTRichTextEditorHTMLAttributes,
});

export const Global = Extension.create<GlobalOptions>({
  name: "mt-rich-text-editor-global",

  addOptions() {
    return {
      additionalGlobalAttributeTypes: [],
    };
  },

  addGlobalAttributes() {
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
          "textStyle",
          "script",
          "svg",
          "tableRow",
          "link",
          "blockLink",
          "descriptionList",
          "descriptionTerm",
          "descriptionDetails",
        ].concat(this.options.additionalGlobalAttributeTypes),
        attributes: {
          MTRichTextEditorHTMLAttributes: createGlobalAttribute(),
        },
      },
      {
        types: ["table", "tableCell"],
        attributes: {
          MTRichTextEditorHTMLAttributes: createGlobalAttribute(["style"]),
        },
      },
      {
        types: ["tableHeader"],
        attributes: {
          MTRichTextEditorHTMLAttributes: createGlobalAttribute(["style", "scope"]),
        },
      },
    ];
  },
});
