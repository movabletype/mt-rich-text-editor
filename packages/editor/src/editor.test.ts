import { globSync, readFileSync } from "node:fs";
import path from "node:path";
import { Editor } from "../src/editor";

describe("HTML parsing", () => {
  let textarea: HTMLTextAreaElement;
  let editor: Editor;

  beforeEach(() => {
    textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    editor = new Editor(textarea, {
      toolbar: [],
      inline: false,
    });
  });

  afterEach(() => {
    editor.destroy();
    textarea.remove();
  });

  it.each([
    "<p><a href='https://example.com'>test</a></p>",
    "<a href='https://example.com'><div>test</div></a>",
    "<a href='https://example.com'><div>test</div></a>",
    '<p class="custom-class">test</p>',
    "<div><p>test <strong>bold</strong> text</p></div>",
    "<div>test</div>",
    "<p>test</p>",
    "<h1>test</h1>",
    "<blockquote>test</blockquote>",
    "<ul><li>test</li></ul>",
    "<ol><li>test</li></ol>",
    "<pre>test</pre>",
    "<p><span>test</span></p>",
    "<p><script src='/js/script.js' data-attribute='{&quot;key&quot;: &quot;value&quot;}'></script></p>",
    "<p><script>console.log('test');</script></p>",
    "<p><span style='top:0' class='custom-class'>test</span></p>",
    "<p><span style='top:0'>t<a href='v' target='v' title='v'>t</a></span></p>",
    "<div class='v'><table style='top:0'><tbody><tr><td style='top:0'>t</td></tr></tbody></table></div>",
    "<p><sub>test1</sub>test2<sup>test3</sup></p>",
    "<p><strong>te<span>st</span></strong></p>",
    "<p><iframe frameborder='v' height='v' src='v' width='v'></iframe></p>",
    "<ul><li style='top:0'><ul class='v'><li><a href='v'>t</a></li></ul></li></ul>",
    "<p><span class='v1'>a</span><span class='v2'>b</span></p>",
  ])("should preserve HTML structure through Tiptap: %s", (input) => {
    editor.setContent(input);
    const output = editor.getContent();
    expect(normalizeHTML(output)).toBe(normalizeHTML(input));
  });

  it.todo.each([
    "<p><span class='v1'><span class='v2'><img alt='v' class='v' height='v' src='v' style='top:0' title='v' width='v' /></span><br /></span></p>",
  ])("TODO:should preserve HTML structure through Tiptap: %s", (input) => {
    editor.setContent(input);
    const output = editor.getContent();
    expect(normalizeHTML(output)).toBe(normalizeHTML(input));
  });

  it.each([
    [
      "<p style='top:0'><strong><a href='v' target='v'>t</a><strong><a href='v' target='v'>t</a></strong></strong></p>",
      "<p style='top:0'><strong><a href='v' target='v'>tt</a></strong></p>",
    ],
    // TBD
    [
      "<p><a href='v' target='v'><span><img alt='v' class='v' height='v' src='v' style='top:0' title='v' width='v' /></span></a></p>",
      "<p><span><a href='v' target='v'><img alt='v' class='v' height='v' src='v' style='top:0' title='v' width='v' /></a></span></p>",
    ],
    // TBD
    [
      "<p><span style='top:0'><strong>test</strong></span></p>",
      "<p><strong><span style='top:0'>test</span></strong></p>",
    ],
  ])("should convert HTML structure through Tiptap: %s", (input, expected) => {
    editor.setContent(input);
    const output = editor.getContent();
    expect(normalizeHTML(output)).toBe(normalizeHTML(expected));
  });

  it("should preserve all html structure", () => {
    const files = globSync(path.join(__dirname, "editor.test.d/**/*.html"));
    for (const file of files) {
      const input = `<p>${file.replace(/.*\/editor.test.d\//, "")}</p>${readFileSync(file, "utf-8")}`;
      editor.setContent(input);
      const output = editor.getContent();

      expect(normalizeHTML(output)).toBe(normalizeHTML(input));
    }
  });
});

const normalizeHTML = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const normalizeStyleAttribute = (element: Element) => {
    if (element.hasAttribute("style")) {
      const styleValue = element.getAttribute("style") || "";
      const normalizedStyle = styleValue
        .split(";")
        .map((rule) => {
          const [property, value] = rule.split(":", 2).map((part) => part.trim());
          return property && value ? `${property}:${value}` : "";
        })
        .filter(Boolean)
        .sort()
        .join(";");

      if (normalizedStyle) {
        element.setAttribute("style", normalizedStyle);
      } else {
        element.removeAttribute("style");
      }
    }

    Array.from(element.children).forEach(normalizeStyleAttribute);
  };

  const sortAttributes = (element: Element) => {
    const attributes = Array.from(element.attributes);
    attributes.sort((a, b) => a.name.localeCompare(b.name));

    for (let i = element.attributes.length - 1; i >= 0; i--) {
      element.removeAttribute(element.attributes[i].name);
    }

    for (const attr of attributes) {
      element.setAttribute(attr.name, attr.value);
    }

    Array.from(element.children).forEach(sortAttributes);
  };

  const formatNode = (node: HTMLElement, depth: number, tab: string) => {
    let result = "";
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        result += `${tab.repeat(depth)}${text}\n`;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();
      result += `${tab.repeat(depth)}<${tagName}`;

      for (const attr of node.attributes) {
        result += ` ${attr.name}="${attr.value}"`;
      }

      if (node.childNodes.length === 0) {
        result += " />\n";
      } else {
        result += ">\n";
        depth++;
        for (const child of node.childNodes) {
          result += formatNode(child as HTMLElement, depth, tab);
        }
        depth--;
        result += `${tab.repeat(depth)}</${tagName}>\n`;
      }
    }
    return result;
  };

  normalizeStyleAttribute(doc.documentElement);
  sortAttributes(doc.documentElement);
  return [...doc.body.children]
    .map((child) => formatNode(child as HTMLElement, 0, "  "))
    .join("\n");
};
