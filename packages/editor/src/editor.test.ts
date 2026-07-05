import { globSync, readFileSync } from "node:fs";
import path from "node:path";
import { Editor } from "../src/editor";
import type { EditorOptions } from "../src/editor";
import type { EditorHarness } from "./test/helpers/editor";
import {
  createEditorHarness,
  normalizeComparableHTML,
  setTextSelectionByText,
} from "./test/helpers/editor";

const htmlRoundTripCases = [
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
  "<p><sub>test1</sub>test2<sup>test3</sup></p>",
  "<p><strong>te<span>st</span></strong></p>",
  "<p><iframe frameborder='v' height='v' src='v' width='v'></iframe></p>",
  "<p><span class='v1'>a</span><span class='v2'>b</span></p>",
  "<figure style='display: inline-block' class='mt-figure'><img src='http://example.com/image.jpg' width='800' height='657' alt='alternative text' class='asset asset-image at-xid-1'/><figcaption>caption text</figcaption></figure>",
  "<hgroup><h1>Title</h1><h2>Subtitle</h2><p>Description</p></hgroup>",
  `<table><tbody><tr><td>b</td></tr></tbody></table>`,
  `<table style="width: 100%"><tbody><tr><td><div>b</div></td></tr></tbody></table>`,
  `<div data-mt-rich-text-editor-embed-object=""><iframe width=" 200" height="113" src="https://www.youtube.com/embed/XUAnkKpHaCI?feature=oembed" frameborder="0" allowfullscreen="allowfullscreen"></iframe></div>`,
  `<div data-mt-rich-text-editor-embed-object=""><div>test</div></div>`,
  `<div data-mt-rich-text-editor-embed-object=""><script async src="https://example.com/embed.js"></script></div>`,
  `<p><ruby> 明日 <rp>(</rp><rt>Ashita</rt><rp>)</rp> </ruby></p>`,
  `<p><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="5 5 10 10" width="100" height="100"><circle cx="10" cy="10" r="5" fill="#c44" /></svg></p>`,
  `<div>あ<a href="http://example.com/">リンクテキスト</a>あ</div>`,
  `<div><sub>a</sub>text<sup>b</sup></div>`,
  `<div><strong>a</strong><em>b</em><u>c</u></div>`,
  `<div><code>x</code><script>y</script></div>`,
  "<div><iframe frameborder='0' src='https://example.com/embed'></iframe><mt-rich-text-editor-mt-function-tag data-tag-name='Var' name='foo'></mt-rich-text-editor-mt-function-tag></div>",
  `<section><div><span data-note="x">nested</span></div></section>`,
  `<div></div>`,
  "<p><button type='button'>Click</button></p>",
  "<div>\n    <p>test</p>\n</div>",
  "<blockquote>\n    <p>test</p>\n</blockquote>",
  "<p style='padding-left: 80px'>test</p>",
  "<p style='padding-left: 2em'>test</p>",
  "<p style='text-align: center'>test</p>",
  "<h2 style='text-align: center'>test</h2>",
] as const;

const htmlConversionCases = [
  [
    "<p><span style='top:0'>t<a href='v' target='v' title='v'>t</a></span></p>",
    "<p><span style='top:0px'>t</span><a href='v' target='v' title='v'><span style='top:0px'>t</span></a></p>",
  ],
  [
    "<p style='top:0'><strong><a href='v' target='v'>t</a><strong><a href='v' target='v'>t</a></strong></strong></p>",
    "<p style='top:0px'><a href='v' target='v'><strong>tt</strong></a></p>",
  ],
  [
    "<p><span><a href='v' target='v'><img alt='v' class='v' height='v' src='v' style='top:0' title='v' width='v' /></a></span></p>",
    "<p><a href='v' target='v'><span><img alt='v' class='v' height='v' src='v' style='top:0px' title='v' width='v' /></span></a></p>",
  ],
  [
    "<p><span style='top:0'><strong>test</strong></span></p>",
    "<p><strong><span style='top:0px'>test</span></strong></p>",
  ],
  [
    "<p><span class='v1'>a<span class='v2'><img alt='v' class='v' height='v' src='v' style='top:0' title='v' width='v' /></span>b</span></p>",
    "<p><span class='v1'>a</span><span class='v2'><img alt='v' class='v' height='v' src='v' style='top:0px' title='v' width='v' /></span><span class='v1'>b</span></p>",
  ],
  [
    "<p><span style='top:0' class='custom-class'>test</span></p>",
    "<p><span class='custom-class' style='top:0px'>test</span></p>",
  ],
  [
    "<p><a href='v' target='v' title='v'>t<span style='top:0'>t</span></a></p>",
    "<p><a href='v' target='v' title='v'>t<span style='top:0px'>t</span></a></p>",
  ],
  [
    "<p><a href='v' target='v'><span><img alt='v' class='v' height='v' src='v' style='top:0' title='v' width='v' /></span></a></p>",
    "<p><a href='v' target='v'><span><img alt='v' class='v' height='v' src='v' style='top:0px' title='v' width='v' /></span></a></p>",
  ],
  [
    "<div class='v'><table style='top:0'><tbody><tr><td style='top:0'>t</td></tr></tbody></table></div>",
    "<div class='v'><table style='top:0px'><tbody><tr><td style='top:0px'>t</td></tr></tbody></table></div>",
  ],
  [
    "<ul><li style='top:0'><ul class='v'><li><a href='v'>t</a></li></ul></li></ul>",
    "<ul><li style='top:0px'><ul class='v'><li><a href='v'>t</a></li></ul></li></ul>",
  ],
  ["<div>\n\n\n</div>", "<div></div>"],
] as const;

describe("HTML round-trip", () => {
  let editor: Editor;
  let harness: EditorHarness;

  const initEditor = (options: Partial<EditorOptions> = {}) => {
    harness?.cleanup();
    harness = createEditorHarness(options);
    ({ editor } = harness);
  };

  beforeEach(() => {
    initEditor();
  });

  afterEach(() => {
    harness.cleanup();
  });

  it.each(htmlRoundTripCases)("preserves HTML structure through Tiptap: %s", (input) => {
    editor.setContent(input);

    expect(normalizeComparableHTML(editor.getContent())).toBe(normalizeComparableHTML(input));
  });

  describe("additionalBlockElements option", () => {
    beforeEach(() => {
      initEditor({
        additionalBlockElements: ["abbr", "address"],
      });
    });

    it.each([
      "<address>123 Main St.<br>City, State ZIP</address>",
      "<abbr title='World Health Organization'>WHO</abbr>",
    ])("preserves additional block elements: %s", (input) => {
      editor.setContent(input);

      expect(normalizeComparableHTML(editor.getContent())).toBe(normalizeComparableHTML(input));
    });
  });

  describe("additionalInlineElements option", () => {
    beforeEach(() => {
      initEditor({
        additionalInlineElements: ["time", "var"],
      });
    });

    it.each([
      "<p>The event is on <time datetime='2023-10-05'>October 5, 2023</time>.</p>",
      "<p>Calculate the <var>x</var> value in the equation.</p>",
    ])("preserves additional inline elements: %s", (input) => {
      editor.setContent(input);

      expect(normalizeComparableHTML(editor.getContent())).toBe(normalizeComparableHTML(input));
    });
  });

  describe("additionalBlockElements option overriding a default inline element", () => {
    beforeEach(() => {
      initEditor({
        additionalBlockElements: ["button"],
      });
    });

    it("treats button as a block element", () => {
      const input = "<div><p>a</p><button>Click</button><p>b</p></div>";
      editor.setContent(input);

      expect(normalizeComparableHTML(editor.getContent())).toBe(normalizeComparableHTML(input));
    });

    it("no longer treats button as inline inside a paragraph", () => {
      editor.setContent("<p>a<button>b</button>c</p>");

      expect(normalizeComparableHTML(editor.getContent())).toBe(
        normalizeComparableHTML("<p>a</p><button>b</button><p>c</p>")
      );
    });
  });

  describe("additionalInlineElements option overriding a default block element", () => {
    beforeEach(() => {
      initEditor({
        additionalInlineElements: ["figure"],
      });
    });

    it("resolves figure as an inline mark instead of a block node", () => {
      editor.setContent("<p><figure>test</figure></p>");

      const marks = editor.tiptap
        .getJSON()
        .content?.flatMap((node) => node.content ?? [])
        .flatMap((node) => node.marks ?? []);

      expect(marks?.some((mark) => mark.type === "figure")).toBe(true);
    });
  });

  it.each(htmlConversionCases)(
    "normalizes HTML structure through Tiptap: %s",
    (input, expected) => {
      editor.setContent(input);

      expect(normalizeComparableHTML(editor.getContent())).toBe(normalizeComparableHTML(expected));
    }
  );

  it("preserves all fixture HTML structures", () => {
    const files = globSync(path.join(__dirname, "editor.test.d/**/*.html"));

    for (const file of files) {
      const input = `<p>${file.replace(/.*\/editor.test.d\//, "")}</p>${readFileSync(file, "utf-8")}`;
      editor.setContent(input);

      expect(normalizeComparableHTML(editor.getContent())).toBe(normalizeComparableHTML(input));
    }
  });

  describe("indent/outdent commands", () => {
    it("increases padding-left by 80px per indent call", () => {
      editor.setContent("<p>t</p>");
      setTextSelectionByText(editor, "t");

      editor.tiptap.chain().focus().indent().run();
      expect(normalizeComparableHTML(editor.getContent())).toBe(
        normalizeComparableHTML("<p style='padding-left: 80px'>t</p>")
      );

      editor.tiptap.chain().focus().indent().run();
      expect(normalizeComparableHTML(editor.getContent())).toBe(
        normalizeComparableHTML("<p style='padding-left: 160px'>t</p>")
      );
    });

    it("outdents a previously saved padding-left back to no indent (regression)", () => {
      editor.setContent("<p style='padding-left: 80px'>t</p>");
      setTextSelectionByText(editor, "t");

      editor.tiptap.chain().focus().outdent().run();

      expect(normalizeComparableHTML(editor.getContent())).toBe(
        normalizeComparableHTML("<p>t</p>")
      );
    });

    it("keeps outdent working after a round-trip through the HTML source modal", () => {
      editor.setContent("<p style='padding-left: 80px'>t</p>");
      editor.setContent(editor.getContent());
      setTextSelectionByText(editor, "t");

      editor.tiptap.chain().focus().outdent().run();

      expect(normalizeComparableHTML(editor.getContent())).toBe(
        normalizeComparableHTML("<p>t</p>")
      );
    });

    it("skips indent/outdent for non-pixel padding-left units", () => {
      editor.setContent("<p style='padding-left: 2em'>t</p>");
      setTextSelectionByText(editor, "t");

      editor.tiptap.chain().focus().indent().run();
      expect(normalizeComparableHTML(editor.getContent())).toBe(
        normalizeComparableHTML("<p style='padding-left: 2em'>t</p>")
      );

      editor.tiptap.chain().focus().outdent().run();
      expect(normalizeComparableHTML(editor.getContent())).toBe(
        normalizeComparableHTML("<p style='padding-left: 2em'>t</p>")
      );
    });

    it("outdents a non-multiple-of-80 padding-left by 80px", () => {
      editor.setContent("<p style='padding-left: 120px'>t</p>");
      setTextSelectionByText(editor, "t");

      editor.tiptap.chain().focus().outdent().run();

      expect(normalizeComparableHTML(editor.getContent())).toBe(
        normalizeComparableHTML("<p style='padding-left: 40px'>t</p>")
      );
    });

    it("does not leave a stale text-align after changing alignment", () => {
      editor.setContent("<p style='text-align: center'>t</p>");
      setTextSelectionByText(editor, "t");

      editor.tiptap.chain().focus().setTextAlign("right").run();

      const html = editor.getContent();
      expect(html).not.toContain("text-align: center");
      expect(normalizeComparableHTML(html)).toBe(
        normalizeComparableHTML("<p style='text-align: right'>t</p>")
      );
    });
  });
});

describe("HTML formatting", () => {
  let editor: Editor;
  let harness: EditorHarness;

  const initEditor = (options: Partial<EditorOptions> = {}) => {
    harness?.cleanup();
    harness = createEditorHarness(options);
    ({ editor } = harness);
  };

  beforeEach(() => {
    initEditor();
  });

  afterEach(() => {
    harness.cleanup();
  });

  describe("with default format option", () => {
    it.each([
      [
        "<p><strong><a>t</a></strong></p><p>next paragraph</p>",
        `<p><a><strong>t</strong></a></p>
<p>next paragraph</p>`,
      ],
      [
        "<p><ruby>明日 <rp>(</rp><rt>Ashita</rt><rp>)</rp></ruby></p>",
        `<p><ruby>明日 <rp>(</rp><rt>Ashita</rt><rp>)</rp></ruby></p>`,
      ],
      [
        `<table style="width: 100%"><tbody><tr><td>b</td></tr></tbody></table>`,
        `<table style="width: 100%;">
<tbody>
<tr>
<td>b</td>
</tr>
</tbody>
</table>`,
      ],
      [
        `<pre><code>
function() {
  console.log("test");
    console.log("test2");
}
</code></pre>`,
        `<pre><code>
function() {
  console.log("test");
    console.log("test2");
}
</code></pre>`,
      ],
      [
        `<p><script>
function() {
  console.log("test");
    console.log("test2");
}
</script></p>`,
        `<p>
<script>
function() {
  console.log("test");
    console.log("test2");
}
</script>
</p>`,
      ],
    ])("outputs formatted HTML: %s", (input, expected) => {
      editor.setContent(input);

      expect(editor.getContent()).toBe(expected);
    });
  });

  describe("with custom format options", () => {
    it("supports format: false", () => {
      initEditor({
        htmlOutputOptions: {
          format: false,
        },
      });

      const input = `<table style="width: 100%"><tbody><tr><td>b</td></tr></tbody></table>`;
      const expected = `<table style="width: 100%;"><tbody><tr><td>b</td></tr></tbody></table>`;
      editor.setContent(input);

      expect(editor.getContent()).toBe(expected);
    });

    it("supports custom indent size", () => {
      initEditor({
        htmlOutputOptions: {
          indentSize: 2,
        },
      });

      editor.setContent(`<table><tbody><tr><td>b</td></tr></tbody></table>`);

      expect(editor.getContent()).toBe(`<table>
  <tbody>
    <tr>
      <td>b</td>
    </tr>
  </tbody>
</table>`);
    });
  });
});

describe("Event emission", () => {
  let editor: Editor;
  let harness: EditorHarness;

  beforeEach(() => {
    harness = createEditorHarness();
    ({ editor } = harness);
  });

  afterEach(() => {
    harness.cleanup();
  });

  it("emits beforeGetContent events", () => {
    editor.on("beforeGetContent", ({ editor }) => {
      editor.tiptap.commands.setHeading({ level: 2 });
    });

    editor.setContent("<h1>Test content</h1>");

    expect(editor.getContent()).toBe("<h2>Test content</h2>");
  });

  it("emits getContent events", () => {
    editor.on("getContent", (data) => {
      data.content += "<p>Appended paragraph</p>";
    });

    editor.setContent("<p>Initial content</p>");

    expect(editor.getContent()).toBe("<p>Initial content</p><p>Appended paragraph</p>");
  });

  it("emits setContent events", () => {
    editor.on("setContent", (data) => {
      expect(data.source).toBe("external");
      data.content = data.content.toUpperCase();
    });

    editor.setContent("<p>Initial content</p>");

    expect(editor.getContent()).toBe("<p>INITIAL CONTENT</p>");
  });

  it("emits setContent events with custom source", () => {
    const source = "text-source";
    editor.on("setContent", (data) => {
      expect(data.source).toBe(source);
      data.content = data.content.toUpperCase();
    });

    editor.setContent({
      source,
      content: "<p>Initial content</p>",
    });

    expect(editor.getContent()).toBe("<p>INITIAL CONTENT</p>");
  });

  it("applies event mutations in observable order", () => {
    const calls: string[] = [];

    editor.on("setContent", (data) => {
      calls.push(`set:${data.source}`);
      data.content = "<p>set content</p>";
    });
    editor.on("beforeGetContent", () => {
      calls.push("beforeGet");
    });
    editor.on("getContent", (data) => {
      calls.push("get");
      data.content += "<p>after get</p>";
    });

    editor.setContent("<p>ignored</p>");

    expect(editor.getContent()).toBe("<p>set content</p><p>after get</p>");
    expect(calls).toEqual(["set:external", "beforeGet", "get"]);
  });
});

describe("Editor lifecycle and public methods", () => {
  let editor: Editor;
  let harness: EditorHarness;

  const initEditor = (
    options: Partial<EditorOptions> = {},
    { textareaId, textareaValue }: { textareaId?: string; textareaValue?: string } = {}
  ) => {
    harness?.cleanup();
    harness = createEditorHarness(options, { textareaId, textareaValue });
    ({ editor } = harness);
  };

  beforeEach(() => {
    initEditor();
  });

  afterEach(() => {
    harness.cleanup();
    vi.restoreAllMocks();
  });

  it("reads the initial textarea value", () => {
    initEditor({}, { textareaValue: "<p>Initial value</p>" });

    expect(editor.getContent()).toBe("<p>Initial value</p>");
  });

  it("updates the textarea value on setContent", () => {
    editor.setContent("<p>Updated</p>");

    expect(harness.textarea.value).toBe("<p>Updated</p>");
  });

  it("writes the current editor content to the textarea on save", () => {
    editor.tiptap.commands.setContent("<p>Saved value</p>");

    expect(harness.textarea.value).toBe("");

    editor.save();

    expect(harness.textarea.value).toBe("<p>Saved value</p>");
  });

  it("preprocesses inserted content before serialization", () => {
    editor.insertContent("<div>after<strong> value</strong></div>");

    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML("<div>after<strong> value</strong></div>")
    );
  });

  it("ignores setHeight(0) and persists non-zero height", () => {
    initEditor({
      height: 420,
    });
    const container = document.querySelector<HTMLElement>(".mt-rich-text-editor");

    expect(container?.style.height).toBe("420px");

    editor.setHeight(0);
    expect(container?.style.height).toBe("420px");

    editor.setHeight(480);
    expect(container?.style.height).toBe("480px");
    expect(localStorage.getItem("mt-rich-text-editor-height")).toBe("480");
  });

  it("toggles structure mode through the public API", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(editor.getStructureMode()).toBe(false);

    editor.setStructureMode(true);
    expect(editor.getStructureMode()).toBe(true);

    editor.setStructureMode(false);
    expect(editor.getStructureMode()).toBe(false);
  });

  it("notifies via alert", () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    editor.notify({ level: "warning", message: "Watch out" });

    expect(alertSpy).toHaveBeenCalledWith("Watch out");
  });

  it("focuses on construction when autoFocus is enabled", () => {
    const focusSpy = vi.spyOn(Editor.prototype, "focus");

    initEditor({
      autoFocus: true,
    });

    expect(focusSpy).toHaveBeenCalled();
  });

  it("exposes preprocessHTML through the public method", () => {
    expect(editor.preprocessHTML("<div>text</div>")).toBe(
      "<div><mt-text-block>text</mt-text-block></div>"
    );
  });

  it("keeps text-selection based edits observable in HTML output", () => {
    editor.setContent("<p>alpha beta</p>");
    setTextSelectionByText(editor, "beta");
    editor.tiptap.chain().focus().toggleBold().run();

    expect(editor.getContent()).toBe("<p>alpha <strong>beta</strong></p>");
  });
});
