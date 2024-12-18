import Quill from "quill";
import { Editor } from "../src/editor";
import "../src/blots";
import "../src/themes/mt";

describe("Blot HTML parsing", () => {
  let textarea: HTMLTextAreaElement;
  let editor: Editor;

  beforeEach(() => {
    textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    const quill = new Quill(textarea);
    editor = new Editor({ quill, textarea });
  });

  afterEach(() => {
    // editor.destroy();
    textarea.remove();
  });

  it.each([
    "<a href='https://example.com'>test</a>",
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
  ])("should preserve HTML structure through Quill: %s", (input) => {
    editor.setContent(input);
    const output = editor.getContent();
    
    expect(output).toBe(normalizeHTML(input));
  });
});

function normalizeHTML(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.innerHTML.trim();
}
