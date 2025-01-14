import { Extension } from "@tiptap/core";

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

export const Global = Extension.create({
  name: "mt-rich-text-editor-global",

  addGlobalAttributes() {
    return [
      {
        types: [
          'div',
          'blockquote',
          'bulletList',
          'codeBlock',
          'document',
          'embedObject',
          'hardBreak',
          'heading',
          'horizontalRule',
          'image',
          'inlineLink',
          'listItem',
          'orderedList',
          'paragraph',
          'span',
          'table',
          'tableRow',
          'tableCell'
        ],
        attributes: {
          MTRichTextEditorHTMLAttributes: {
            default: {},
            parseHTML: (element: HTMLElement) => {
              const attrs: Record<string, string> = {};
              const eventAttrs: Record<string, string> = {};
              for (const attr of element.attributes) {
                if (/^data-mt-rich-text-editor-/.test(attr.name)) {
                  continue;
                }
                if (eventAttrNames.has(attr.name.toLowerCase())) {
                  eventAttrs[attr.name] = attr.value;
                } else {
                  attrs[attr.name] = attr.value;
                }
              }

              if (Object.keys(eventAttrs).length > 0) {
                attrs["data-mt-rich-text-editor-event-attributes"] = JSON.stringify(eventAttrs);
              }
              return attrs;
            },
            renderHTML: (attributes) => attributes.MTRichTextEditorHTMLAttributes,
          },
        },
      },
    ];
  },
});
