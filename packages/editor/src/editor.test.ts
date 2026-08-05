import { globSync, readFileSync } from "node:fs";
import path from "node:path";
import { Editor } from "../src/editor";
import type { EditorOptions } from "../src/editor";
import type { EditorHarness } from "./test/helpers/editor";
import {
  createEditorHarness,
  flushMicrotasks,
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
  "<p><span style='color: red'>test</span></p>",
  "<p><span style='background-color: blue; color: red'>test</span></p>",
  "<p><script src='/js/script.js' data-attribute='{&quot;key&quot;: &quot;value&quot;}'></script></p>",
  "<p><script>console.log('test');</script></p>",
  "<p><span class='custom-class' style='color: red'>test</span></p>",
  "<p><sub>test1</sub>test2<sup>test3</sup></p>",
  "<p><strong>te<span>st</span></strong></p>",
  "<p><iframe frameborder='v' height='v' src='v' width='v'></iframe></p>",
  '<p><img src="data:image/png;base64,AAAA"></p>',
  "<p><span class='v1'>a</span><span class='v2'>b</span></p>",
  "<figure style='display: inline-block' class='mt-figure'><img src='http://example.com/image.jpg' width='800' height='657' alt='alternative text' class='asset asset-image at-xid-1'/><figcaption>caption text</figcaption></figure>",
  "<hgroup><h1>Title</h1><h2>Subtitle</h2><p>Description</p></hgroup>",
  `<table><tbody><tr><td>b</td></tr></tbody></table>`,
  `<table style="width: 100%"><tbody><tr><td><div>b</div></td></tr></tbody></table>`,
  `<table style="border-style: dashed; border-color: red; width: 100%"><tbody><tr><td style="border-style: dashed; border-color: red">b</td></tr></tbody></table>`,
  `<table style="padding: 4px; background-color: blue; width: 100%"><tbody><tr><td style="padding: 4px; background-color: blue">b</td></tr></tbody></table>`,
  `<table border="1" style="border-collapse: collapse; width: 100%"><tbody><tr><td>b</td></tr></tbody></table>`,
  `<table><tbody><tr><th scope="col">h</th><td scope="row">b</td></tr></tbody></table>`,
  `<div data-mt-rich-text-editor-embed-object=""><iframe width=" 200" height="113" src="https://www.youtube.com/embed/XUAnkKpHaCI?feature=oembed" frameborder="0" allowfullscreen="allowfullscreen"></iframe></div>`,
  `<div data-mt-rich-text-editor-embed-object=""><div>test</div></div>`,
  `<div data-mt-rich-text-editor-embed-object=""><script async src="https://example.com/embed.js"></script></div>`,
  `<p><ruby> 明日 <rp>(</rp><rt>Ashita</rt><rp>)</rp> </ruby></p>`,
  `<p><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="5 5 10 10" width="100" height="100"><circle cx="10" cy="10" r="5" fill="#c44" /></svg></p>`,
  `<div>あ<a href="http://example.com/">リンクテキスト</a>あ</div>`,
  `<div><sub>a</sub>text<sup>b</sup></div>`,
  `<div><strong>a</strong><em>b</em><u>c</u></div>`,
  `<p><em>a</em><i>b</i></p>`,
  `<p>a<i>b</i>c</p>`,
  `<p><strong>a</strong><b>b</b></p>`,
  `<p><s>a</s><del>b</del><strike>c</strike></p>`,
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
    "<p><span style='color: red'><span style='background-color: blue'>test</span></span></p>",
    "<p><span style='color: red; background-color: blue'>test</span></p>",
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
  [
    '<p><img src="/a.png" data-mt-rich-text-editor-upload-session="s1" data-mt-rich-text-editor-upload-session-index="0"></p>',
    "",
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

  it("preserves text color when applying background color to reloaded content", () => {
    editor.setContent("<p><span style='color: red'>test</span></p>");
    setTextSelectionByText(editor, "test");

    editor.tiptap.chain().focus().setBackgroundColor("blue").run();

    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML("<p><span style='color: red; background-color: blue'>test</span></p>")
    );
  });

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

    it("treats non-pixel padding-left units as level 0 when indenting", () => {
      editor.setContent("<p style='padding-left: 2em'>t</p>");
      setTextSelectionByText(editor, "t");

      editor.tiptap.chain().focus().indent().run();
      expect(normalizeComparableHTML(editor.getContent())).toBe(
        normalizeComparableHTML("<p style='padding-left: 80px'>t</p>")
      );
    });

    it("treats non-pixel padding-left units as level 0 when outdenting", () => {
      editor.setContent("<p style='padding-left: 2em'>t</p>");
      setTextSelectionByText(editor, "t");

      editor.tiptap.chain().focus().outdent().run();
      expect(normalizeComparableHTML(editor.getContent())).toBe(
        normalizeComparableHTML("<p>t</p>")
      );
    });

    it("treats unitless zero padding-left as level 0 when indenting", () => {
      editor.setContent("<p style='padding-left: 0'>t</p>");
      setTextSelectionByText(editor, "t");

      editor.tiptap.chain().focus().indent().run();
      expect(normalizeComparableHTML(editor.getContent())).toBe(
        normalizeComparableHTML("<p style='padding-left: 80px'>t</p>")
      );
    });

    it("treats unitless zero padding-left as level 0 when outdenting", () => {
      editor.setContent("<p style='padding-left: 0'>t</p>");
      setTextSelectionByText(editor, "t");

      editor.tiptap.chain().focus().outdent().run();
      expect(normalizeComparableHTML(editor.getContent())).toBe(
        normalizeComparableHTML("<p>t</p>")
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

describe("dedicated attributes of table types", () => {
  let editor: Editor;
  let harness: EditorHarness;

  beforeEach(() => {
    harness = createEditorHarness();
    ({ editor } = harness);
  });

  afterEach(() => {
    harness.cleanup();
  });

  it("keeps dedicated attributes out of MTRichTextEditorHTMLAttributes for table, tableCell and tableHeader", () => {
    editor.setContent(
      `<table border="1" style="border-collapse: collapse; width: 100%"><tbody><tr><th scope="col" style="width: 30%">h</th><td class="cell" scope="row" style="text-align: center">b</td></tr></tbody></table>`
    );

    const table = editor.tiptap.getJSON().content?.find((node) => node.type === "table");
    expect(table?.attrs?.style).toBe("border-collapse: collapse; width: 100%");
    expect(table?.attrs?.MTRichTextEditorHTMLAttributes).toEqual({ border: "1" });

    const firstRow = table?.content?.[0];
    const [header, cell] = (firstRow && "content" in firstRow ? firstRow.content : undefined) ?? [];
    expect(header?.attrs?.style).toBe("width: 30%");
    expect(header?.attrs?.scope).toBe("col");
    expect(header?.attrs?.MTRichTextEditorHTMLAttributes).toEqual({});
    expect(cell?.attrs?.style).toBe("text-align: center");
    expect(cell?.attrs?.scope).toBe("row");
    expect(cell?.attrs?.MTRichTextEditorHTMLAttributes).toEqual({ class: "cell" });
  });

  it("does not resurrect old style declarations when the dedicated style attribute is edited", () => {
    editor.setContent(
      `<table style="border-collapse: collapse; width: 100%"><tbody><tr><td>b</td></tr></tbody></table>`
    );

    // Mimic the table-properties panel: replace the dedicated style attribute.
    let tablePos = -1;
    editor.tiptap.state.doc.descendants((node, pos) => {
      if (node.type.name === "table") {
        tablePos = pos;
      }
    });
    editor.tiptap
      .chain()
      .command(({ tr }) => {
        const node = tr.doc.nodeAt(tablePos);
        if (!node) {
          return false;
        }
        tr.setNodeMarkup(tablePos, null, { ...node.attrs, style: "width: 50%;" });
        return true;
      })
      .run();

    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML(
        `<table style="width: 50%;"><tbody><tr><td>b</td></tr></tbody></table>`
      )
    );
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

describe("Structure mode", () => {
  let editor: Editor;
  let harness: EditorHarness;

  const initEditor = (options: Partial<EditorOptions> = {}) => {
    harness?.cleanup();
    harness = createEditorHarness(options);
    ({ editor } = harness);
  };

  const getStructureModeStyleText = (): string => {
    const root = editor.tiptap.view.dom.getRootNode() as Document | ShadowRoot;
    const styles = root.querySelectorAll("style");
    return styles[styles.length - 1]?.textContent ?? "";
  };

  const setModalValue = (id: string, value: string) => {
    const input = document.querySelector<HTMLInputElement>(`#${id}`);
    expect(input).not.toBeNull();
    input!.value = value;
    input!.dispatchEvent(new Event("input"));
    input!.dispatchEvent(new Event("change"));
  };

  const submitModal = async () => {
    document.querySelector<HTMLButtonElement>(".modal button.primary")?.click();
    await flushMicrotasks();
  };

  const clickStructureTarget = async (domNode: HTMLElement) => {
    domNode.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    await flushMicrotasks();
  };

  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    initEditor();
  });

  afterEach(() => {
    harness.cleanup();
    vi.restoreAllMocks();
  });

  it("targets the tableWrapper NodeView wrapper (not the inner table element), labeling it with the table node's own attributes and keeping its outline visible", () => {
    editor.setContent(
      "<table id='t1' class='fancy' style='color: red'><tbody><tr><td>b</td></tr></tbody></table>"
    );

    editor.setStructureMode(true);

    const styleText = getStructureModeStyleText();
    // The rule's selector still targets the wrapper div's own DOM attributes.
    expect(styleText).toMatch(/div\[class="tableWrapper"\]\s*\{/);
    // The inner <table> element itself is not a structure-mode target.
    expect(styleText).not.toMatch(/^table \{/m);
    // ...but its outline label describes the table node it wraps.
    expect(styleText).toContain('content: "table[id=\\"t1\\"]');
    expect(styleText).toContain('[class=\\"fancy\\"]');
    expect(styleText).toContain('[style=\\"color: red\\"]"');
    // content.css's .tableWrapper sets `overflow-x: auto`, which clips the
    // label positioned above the wrapper's top edge unless structure mode
    // restores `overflow: visible` for the duration.
    expect(styleText).toContain("overflow: visible;");
  });

  it("opens the modal for the tableWrapper NodeView wrapper, prefilled from the table node's attributes, and does nothing for the inner table element", async () => {
    editor.setContent(
      "<table id='t1' class='fancy' style='color: red'><tbody><tr><td>b</td></tr></tbody></table>"
    );
    editor.setStructureMode(true);

    const tableEl = editor.tiptap.view.dom.querySelector<HTMLElement>("table");
    await clickStructureTarget(tableEl!);
    expect(document.querySelector(".modal")).toBeNull();

    const wrapperDiv = editor.tiptap.view.dom.querySelector<HTMLElement>("div.tableWrapper");
    expect(wrapperDiv).not.toBeNull();
    await clickStructureTarget(wrapperDiv!);

    expect(document.querySelector(".modal")).not.toBeNull();
    // The wrapper NodeView doesn't mirror id/class onto its DOM (see
    // isTableWrapperNodeView), so this also verifies the modal is prefilled
    // from the table document node's attrs, not the clicked wrapper DOM's.
    expect(document.querySelector<HTMLInputElement>("#structure-id")!.value).toBe("t1");
    expect(document.querySelector<HTMLInputElement>("#structure-class-name")!.value).toBe("fancy");
    expect(document.querySelector<HTMLInputElement>("#structure-style")!.value).toBe("color: red");
  });

  it("updates table attributes, including the dedicated style attribute, through the structure modal", async () => {
    editor.setContent("<table style='top: 0'><tbody><tr><td>b</td></tr></tbody></table>");
    editor.setStructureMode(true);

    const wrapperDiv = editor.tiptap.view.dom.querySelector<HTMLElement>("div.tableWrapper");
    await clickStructureTarget(wrapperDiv!);

    setModalValue("structure-id", "my-table");
    setModalValue("structure-class-name", "fancy");
    setModalValue("structure-style", "color: red");
    await submitModal();

    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML(
        "<table id='my-table' class='fancy' style='color: red'><tbody><tr><td>b</td></tr></tbody></table>"
      )
    );
  });

  it("clears the dedicated style attribute (not just MTRichTextEditorHTMLAttributes) when the modal style field is emptied", async () => {
    editor.setContent("<table style='top: 0'><tbody><tr><td>b</td></tr></tbody></table>");
    editor.setStructureMode(true);

    const wrapperDiv = editor.tiptap.view.dom.querySelector<HTMLElement>("div.tableWrapper");
    await clickStructureTarget(wrapperDiv!);

    setModalValue("structure-style", "");
    await submitModal();

    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML("<table><tbody><tr><td>b</td></tr></tbody></table>")
    );
  });

  it("still allows editing a plain div through the structure modal", async () => {
    editor.setContent("<div>text</div>");
    editor.setStructureMode(true);

    const divEl = editor.tiptap.view.dom.querySelector<HTMLElement>("div");
    await clickStructureTarget(divEl!);

    setModalValue("structure-id", "my-div");
    setModalValue("structure-class-name", "highlighted");
    await submitModal();

    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML("<div id='my-div' class='highlighted'>text</div>")
    );
  });
});
