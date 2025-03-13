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
  ])("should preserve HTML structure through Tiptap: %s", (input) => {
    editor.setContent(input);
    const output = editor.getContent();
    expect(normalizeHTML(output)).toBe(normalizeHTML(input));
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
