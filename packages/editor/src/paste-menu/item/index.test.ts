import { Editor } from "../../editor";
import type { EditorOptions } from "../../editor";
import type { MountedEditorElement } from "../../test/helpers/editor";
import { findTextPosition, mountEditorElement, setTextSelection } from "../../test/helpers/editor";
import { AsText } from "./index";
import type { PasteMenuItemElement } from "./element";

const ELEMENT_NAME = "mt-paste-menu-item-text";

const normalizeMarkup = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.innerHTML;
};

describe("AsText", () => {
  let element: HTMLElement & PasteMenuItemElement;
  let editor: Editor;
  let harness: MountedEditorElement<HTMLElement & PasteMenuItemElement>;

  const initElement = (options: Partial<EditorOptions> = {}) => {
    harness?.cleanup();
    harness = mountEditorElement<HTMLElement & PasteMenuItemElement>({
      tagName: ELEMENT_NAME,
      elementClass: AsText,
      editorOptions: options,
    });
    ({ element, editor } = harness);
  };

  const applyPaste = (plainText: string) => {
    const chainApi = {
      undo: () => chainApi,
      focus: () => chainApi,
      run: () => true,
    };
    const chainSpy = vi.spyOn(editor.tiptap, "chain").mockImplementation(() => chainApi as never);

    element.content = {
      plainText,
      htmlDocument: null,
      targetDomNode: null,
      clipboardData: new DataTransfer(),
      transaction: (cb) => cb(),
    };

    element.onEditorPaste();
    chainSpy.mockRestore();
  };

  beforeEach(() => {
    initElement();
  });

  afterEach(() => {
    harness.cleanup();
  });

  it("keeps single-line content as plain text", () => {
    editor.setContent("<p>ab</p>");
    setTextSelection(editor, findTextPosition(editor, "ab", 1));

    applyPaste(" foo ");

    expect(normalizeMarkup(editor.tiptap.getHTML())).toBe("<p>a foo b</p>");
  });

  it("keeps multiline content as plain text inside pre", () => {
    editor.setContent("<pre>ab</pre>");
    setTextSelection(editor, findTextPosition(editor, "ab", 1));

    applyPaste("x\ny");

    expect(editor.tiptap.state.doc.firstChild?.type.name).toBe("pre");
    expect(editor.tiptap.state.doc.textContent).toBe("ax\nyb");
  });

  it("converts a single newline to br in paragraph", () => {
    editor.setContent("<p>ab</p>");
    setTextSelection(editor, findTextPosition(editor, "ab", 1));

    applyPaste("x\ny");

    expect(normalizeMarkup(editor.tiptap.getHTML())).toBe("<p>ax<br>yb</p>");
  });

  it("preserves strong marks for multiline paste in paragraph", () => {
    editor.setContent("<p><strong>ab</strong></p>");
    setTextSelection(editor, findTextPosition(editor, "ab", 1));

    applyPaste("x\ny");

    expect(normalizeMarkup(editor.tiptap.getHTML())).toBe(
      "<p><strong>ax</strong><br><strong>yb</strong></p>"
    );
  });

  it("preserves em marks for multiline paste across paragraphs", () => {
    editor.setContent("<p><em>ab</em></p>");
    setTextSelection(editor, findTextPosition(editor, "ab", 1));

    applyPaste("x\n\ny");

    expect(normalizeMarkup(editor.tiptap.getHTML())).toBe("<p><em>ax</em></p><p><em>yb</em></p>");
  });

  it("converts two newlines into sibling paragraphs", () => {
    editor.setContent("<p>ab</p>");
    setTextSelection(editor, findTextPosition(editor, "ab", 1));

    applyPaste("x\n\ny");

    expect(normalizeMarkup(editor.tiptap.getHTML())).toBe("<p>ax</p><p>yb</p>");
  });

  it("adds empty paragraphs for three or more newlines", () => {
    editor.setContent("<p>ab</p>");
    setTextSelection(editor, findTextPosition(editor, "ab", 1));

    applyPaste("x\n\n\ny");

    expect(normalizeMarkup(editor.tiptap.getHTML())).toBe("<p>ax</p><p></p><p>yb</p>");
  });

  it("extends the last generated paragraph with trailing text", () => {
    editor.setContent("<p>abcd</p>");
    setTextSelection(editor, findTextPosition(editor, "abcd", 2));

    applyPaste("x\n\ny");

    expect(normalizeMarkup(editor.tiptap.getHTML())).toBe("<p>abx</p><p>ycd</p>");
  });

  it("converts line breaks to br inside textBlocks", () => {
    editor.setContent("<ul><li>ab</li></ul>");
    setTextSelection(editor, findTextPosition(editor, "ab", 1));

    applyPaste("x\n\ny");

    expect(normalizeMarkup(editor.tiptap.getHTML())).toBe(
      "<ul><li><mt-text-block>ax<br><br>yb</mt-text-block></li></ul>"
    );
  });

  it("reconstructs paragraph content after a multi-block selection", () => {
    editor.setContent("<p>ab</p><p>cd</p>");
    setTextSelection(editor, findTextPosition(editor, "ab", 1), findTextPosition(editor, "cd", 1));

    applyPaste("x\n\ny");

    expect(normalizeMarkup(editor.tiptap.getHTML())).toBe("<p>ax</p><p>yd</p>");
  });

  it("reconstructs textBlock content after a multi-block selection into one block", () => {
    editor.tiptap.commands.setContent({
      type: "doc",
      content: [
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "textBlock",
                  content: [{ type: "text", text: "ab" }],
                },
                {
                  type: "textBlock",
                  content: [{ type: "text", text: "cd" }],
                },
              ],
            },
          ],
        },
      ],
    });
    setTextSelection(editor, findTextPosition(editor, "ab", 1), findTextPosition(editor, "cd", 1));

    applyPaste("x\n\ny");

    expect(normalizeMarkup(editor.tiptap.getHTML())).toBe(
      "<ul><li><mt-text-block>ax<br><br>yd</mt-text-block></li></ul>"
    );
  });

  it("inserts first line into heading and rest into paragraphs", () => {
    editor.setContent("<h1>ab</h1>");
    setTextSelection(editor, findTextPosition(editor, "ab", 1));

    applyPaste("x\ny");

    expect(normalizeMarkup(editor.tiptap.getHTML())).toBe("<h1>ax</h1><p>yb</p>");
  });

  it("drops one separator newline before paragraph remainder in heading", () => {
    editor.setContent("<h1>ab</h1>");
    setTextSelection(editor, findTextPosition(editor, "ab", 1));

    applyPaste("x\n\ny");

    expect(normalizeMarkup(editor.tiptap.getHTML())).toBe("<h1>ax</h1><p>yb</p>");
  });

  it("keeps additional blank lines in heading remainder as paragraphs", () => {
    editor.setContent("<h1>ab</h1>");
    setTextSelection(editor, findTextPosition(editor, "ab", 1));

    applyPaste("x\n\n\ny");

    expect(normalizeMarkup(editor.tiptap.getHTML())).toBe("<h1>ax</h1><p></p><p>yb</p>");
  });

  it("drops leading blank lines before choosing the heading line", () => {
    editor.setContent("<h1>ab</h1>");
    setTextSelection(editor, findTextPosition(editor, "ab", 1));

    applyPaste("\n\nx\ny");

    expect(normalizeMarkup(editor.tiptap.getHTML())).toBe("<h1>ax</h1><p>yb</p>");
  });

  it("reconstructs heading content after a multi-block selection", () => {
    editor.setContent("<h1>ab</h1><p>cd</p>");
    setTextSelection(editor, findTextPosition(editor, "ab", 1), findTextPosition(editor, "cd", 1));

    applyPaste("x\n\ny");

    expect(normalizeMarkup(editor.tiptap.getHTML())).toBe("<h1>ax</h1><p>yd</p>");
  });

  it("normalizes CRLF and CR in heading structured paste", () => {
    editor.setContent("<h1>ab</h1>");
    setTextSelection(editor, findTextPosition(editor, "ab", 1));

    applyPaste("x\r\ny\rz");

    expect(normalizeMarkup(editor.tiptap.getHTML())).toBe("<h1>ax</h1><p>y<br>zb</p>");
  });

  it("handles summary like heading for multiline paste", () => {
    editor.setContent("<summary>ab</summary>");
    setTextSelection(editor, findTextPosition(editor, "ab", 1));

    applyPaste("x\n\ny");

    expect(normalizeMarkup(editor.tiptap.getHTML())).toBe("<summary>ax</summary><p>yb</p>");
  });

  it("reconstructs summary content after a multi-block selection", () => {
    editor.setContent("<summary>ab</summary><p>cd</p>");
    setTextSelection(editor, findTextPosition(editor, "ab", 1), findTextPosition(editor, "cd", 1));

    applyPaste("x\n\ny");

    expect(normalizeMarkup(editor.tiptap.getHTML())).toBe("<summary>ax</summary><p>yd</p>");
  });

  it("falls back to plain text in unsupported non-heading block types", () => {
    editor.setContent("<blockquote>ab</blockquote>");
    setTextSelection(editor, findTextPosition(editor, "ab", 1));

    applyPaste("x\ny");

    expect(editor.tiptap.state.doc.firstChild?.type.name).toBe("blockquote");
    expect(editor.tiptap.state.doc.textContent).toBe("axyb");
  });

  it("normalizes CRLF and CR before converting line breaks", () => {
    editor.setContent("<p>ab</p>");
    setTextSelection(editor, findTextPosition(editor, "ab", 1));

    applyPaste("x\r\ny\rz");

    expect(normalizeMarkup(editor.tiptap.getHTML())).toBe("<p>ax<br>y<br>zb</p>");
  });

  it("trims edge blank lines and keeps all internal line breaks in textBlock", () => {
    editor.setContent("<ul><li>ab</li></ul>");
    setTextSelection(editor, findTextPosition(editor, "ab", 1));

    applyPaste("\n\nx\n\n\ny\n\n");

    expect(normalizeMarkup(editor.tiptap.getHTML())).toBe(
      "<ul><li><mt-text-block>ax<br><br><br>yb</mt-text-block></li></ul>"
    );
  });

  it("normalizes CRLF and CR to br inside textBlock", () => {
    editor.setContent("<ul><li>ab</li></ul>");
    setTextSelection(editor, findTextPosition(editor, "ab", 1));

    applyPaste("x\r\ny\rz");

    expect(normalizeMarkup(editor.tiptap.getHTML())).toBe(
      "<ul><li><mt-text-block>ax<br>y<br>zb</mt-text-block></li></ul>"
    );
  });
});
