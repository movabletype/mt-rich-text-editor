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
  ])("should preserve HTML structure through Tiptap: %s", (input) => {
    editor.setContent(input);
    const output = editor.getContent();

    expect(output).toBe(normalizeHTML(input));
  });

  it("should preserve all html structure", () => {
    const files = globSync(path.join(__dirname, "editor.test.d/**/*.html"));
    for (const file of files) {
      const input = `<p>${file.replace(/.*\/editor.test.d\//, "")}</p>${readFileSync(file, "utf-8")}`
        .replace(/>\n</g, "><")
        .replace(/onclick="v"> <img/g, 'onclick="v"><img')
        .replace(/<span> <img class="v/g, '<span><img class="v');
      editor.setContent(input);
      const output = editor.getContent();
      expect(output).toBe(normalizeHTML(input));
    }
  });
});

function normalizeHTML(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.innerHTML.trim();
}
