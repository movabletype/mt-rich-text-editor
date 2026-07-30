import { Editor } from "../../../editor";
import type { EditorHarness } from "../../../test/helpers/editor";
import { createEditorHarness, normalizeComparableHTML } from "../../../test/helpers/editor";
import { insertTable } from "./insert-table";

describe("insertTable", () => {
  let editor: Editor;
  let harness: EditorHarness;

  beforeEach(() => {
    harness = createEditorHarness();
    ({ editor } = harness);
  });

  afterEach(() => {
    harness.cleanup();
  });

  it("inserts a table with TinyMCE-compatible border attributes", () => {
    insertTable(editor.tiptap, 2, 3);

    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML(
        `<table border="1" style="border-collapse: collapse; width: 100%;">
          <tbody>
            <tr><td></td><td></td><td></td></tr>
            <tr><td></td><td></td><td></td></tr>
          </tbody>
        </table>`
      )
    );
  });

  it("falls back to the default attributes when initialAttributes is null", () => {
    insertTable(editor.tiptap, 2, 3, null);

    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML(
        `<table border="1" style="border-collapse: collapse; width: 100%;">
          <tbody>
            <tr><td></td><td></td><td></td></tr>
            <tr><td></td><td></td><td></td></tr>
          </tbody>
        </table>`
      )
    );
  });

  it("keeps the inserted table stable across a getContent/setContent round trip", () => {
    insertTable(editor.tiptap, 2, 3);

    const firstContent = editor.getContent();
    editor.setContent(firstContent);
    const secondContent = editor.getContent();

    expect(normalizeComparableHTML(secondContent)).toBe(normalizeComparableHTML(firstContent));
  });

  it("applies only the given initialAttributes, replacing the default entirely", () => {
    insertTable(editor.tiptap, 2, 3, { class: "my-table", style: "width: 50%;" });

    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML(
        `<table class="my-table" style="width: 50%;">
          <tbody>
            <tr><td></td><td></td><td></td></tr>
            <tr><td></td><td></td><td></td></tr>
          </tbody>
        </table>`
      )
    );
  });

  it("inserts a bare table with no attributes when initialAttributes is empty", () => {
    insertTable(editor.tiptap, 2, 3, {});

    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML(
        `<table>
          <tbody>
            <tr><td></td><td></td><td></td></tr>
            <tr><td></td><td></td><td></td></tr>
          </tbody>
        </table>`
      )
    );
  });

  it("quarantines event handler attributes the same way as parsing HTML does", () => {
    insertTable(editor.tiptap, 1, 1, { onclick: "doSomething()" });

    const table = editor.tiptap.getJSON().content?.find((node) => node.type === "table");
    expect(table?.attrs?.MTRichTextEditorHTMLAttributes).toEqual({
      "data-mt-rich-text-editor-event-attributes": JSON.stringify({
        onclick: "doSomething()",
      }),
    });
    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML(
        `<table onclick="doSomething()"><tbody><tr><td></td></tr></tbody></table>`
      )
    );
  });

  it("drops internal data-mt-rich-text-editor-* keys instead of breaking getContent", () => {
    insertTable(editor.tiptap, 1, 1, {
      "data-mt-rich-text-editor-event-attributes": "not json",
    });

    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML(`<table><tbody><tr><td></td></tr></tbody></table>`)
    );
  });

  it("drops internal data-mt-rich-text-editor-* keys regardless of casing", () => {
    // The DOM lowercases attribute names on serialization, so a mixed-case
    // key would otherwise become a real internal attribute and break the
    // JSON.parse in normalizeHTML.
    insertTable(editor.tiptap, 1, 1, {
      "Data-Mt-Rich-Text-Editor-Event-Attributes": "not json",
    });

    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML(`<table><tbody><tr><td></td></tr></tbody></table>`)
    );
  });
});
