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

  it("keeps the inserted table stable across a getContent/setContent round trip", () => {
    insertTable(editor.tiptap, 2, 3);

    const firstContent = editor.getContent();
    editor.setContent(firstContent);
    const secondContent = editor.getContent();

    expect(normalizeComparableHTML(secondContent)).toBe(normalizeComparableHTML(firstContent));
  });
});
