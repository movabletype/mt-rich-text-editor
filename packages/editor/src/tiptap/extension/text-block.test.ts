import { Editor } from "../../editor";
import type { EditorHarness } from "../../test/helpers/editor";
import {
  createEditorHarness,
  findTextPosition,
  normalizeComparableHTML,
  setTextSelection,
} from "../../test/helpers/editor";

describe("TextBlock", () => {
  let editor: Editor;
  let harness: EditorHarness;

  const waitForBackspaceNormalization = () => new Promise((resolve) => setTimeout(resolve, 0));
  const findFirstEmptyTextBlockPosition = (editor: Editor) => {
    let position = -1;

    editor.tiptap.state.doc.descendants((node, nodePos) => {
      if (node.type.name === "textBlock" && node.content.size === 0) {
        position = nodePos + 1;
        return false;
      }
    });

    if (position === -1) {
      throw new Error("Empty textBlock not found");
    }

    return position;
  };

  const initEditor = () => {
    harness?.cleanup();
    harness = createEditorHarness();
    ({ editor } = harness);
  };

  beforeEach(() => {
    initEditor();
  });

  afterEach(() => {
    harness.cleanup();
  });

  it("collapses adjacent textBlocks in div wrappers after Backspace", async () => {
    editor.setContent("<div>a</div><div>b</div>");
    setTextSelection(editor, findTextPosition(editor, "b"));

    editor.tiptap.commands.keyboardShortcut("Backspace");
    await waitForBackspaceNormalization();

    expect(editor.tiptap.getHTML()).toBe("<div><mt-text-block>ab</mt-text-block></div>");
    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML("<div>ab</div>")
    );

    editor.tiptap.commands.insertContent("x");

    expect(editor.tiptap.getHTML()).toBe("<div><mt-text-block>axb</mt-text-block></div>");
    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML("<div>axb</div>")
    );
  });

  it("collapses adjacent textBlocks in non-div wrappers after Backspace", async () => {
    editor.setContent("<blockquote>a</blockquote><blockquote>b</blockquote>");
    setTextSelection(editor, findTextPosition(editor, "b"));

    editor.tiptap.commands.keyboardShortcut("Backspace");
    await waitForBackspaceNormalization();

    expect(editor.tiptap.getHTML()).toBe(
      "<blockquote><mt-text-block>ab</mt-text-block></blockquote>"
    );
    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML("<blockquote>ab</blockquote>")
    );
  });

  it("deletes the last character in a textBlock without creating a sibling wrapper", async () => {
    editor.setContent("<div>a</div>");
    setTextSelection(editor, findTextPosition(editor, "a", 1));

    editor.tiptap.commands.keyboardShortcut("Backspace");
    await waitForBackspaceNormalization();

    expect(editor.tiptap.getHTML()).toBe("<div><mt-text-block></mt-text-block></div>");
    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML("<div></div>")
    );

    editor.tiptap.commands.insertContent("x");

    expect(editor.tiptap.getHTML()).toBe("<div><mt-text-block>x</mt-text-block></div>");
    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML("<div>x</div>")
    );
  });

  it("deletes an emoji as a single character on Backspace", async () => {
    editor.setContent("<div>😀</div>");
    setTextSelection(editor, findTextPosition(editor, "😀", "😀".length));

    editor.tiptap.commands.keyboardShortcut("Backspace");
    await waitForBackspaceNormalization();

    expect(editor.tiptap.getHTML()).toBe("<div><mt-text-block></mt-text-block></div>");
    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML("<div></div>")
    );
  });

  it("deletes a combining-character grapheme on Backspace", async () => {
    const grapheme = "e\u0301";
    editor.setContent(`<div>${grapheme}</div>`);
    setTextSelection(editor, findTextPosition(editor, grapheme, grapheme.length));

    editor.tiptap.commands.keyboardShortcut("Backspace");
    await waitForBackspaceNormalization();

    expect(editor.tiptap.getHTML()).toBe("<div><mt-text-block></mt-text-block></div>");
    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML("<div></div>")
    );
  });

  it("prevents unwrapping the first top-level div on Backspace at the start", async () => {
    editor.setContent("<div>a</div>");
    setTextSelection(editor, findTextPosition(editor, "a"));

    editor.tiptap.commands.keyboardShortcut("Backspace");
    await waitForBackspaceNormalization();

    expect(editor.tiptap.getHTML()).toBe("<div><mt-text-block>a</mt-text-block></div>");
    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML("<div>a</div>")
    );

    editor.tiptap.commands.insertContent("x");

    expect(editor.tiptap.getHTML()).toBe("<div><mt-text-block>xa</mt-text-block></div>");
    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML("<div>xa</div>")
    );
  });

  it("prevents unwrapping the first top-level non-div wrapper on Backspace at the start", async () => {
    editor.setContent("<blockquote>a</blockquote>");
    setTextSelection(editor, findTextPosition(editor, "a"));

    editor.tiptap.commands.keyboardShortcut("Backspace");
    await waitForBackspaceNormalization();

    expect(editor.tiptap.getHTML()).toBe(
      "<blockquote><mt-text-block>a</mt-text-block></blockquote>"
    );
    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML("<blockquote>a</blockquote>")
    );
  });

  it("deletes an empty first top-level wrapper on Backspace at the start", async () => {
    editor.setContent("<div></div>");
    setTextSelection(editor, findFirstEmptyTextBlockPosition(editor));

    editor.tiptap.commands.keyboardShortcut("Backspace");
    await waitForBackspaceNormalization();

    expect(editor.tiptap.getHTML()).toBe("<p></p>");
    expect(editor.getContent()).toBe("");

    editor.tiptap.commands.insertContent("x");

    expect(editor.tiptap.getHTML()).toBe("<p>x</p>");
    expect(editor.getContent()).toBe("<p>x</p>");
  });
});
