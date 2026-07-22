import { Editor } from "../../../editor";
import type { EditorHarness } from "../../../test/helpers/editor";
import { createEditorHarness, setTextSelectionByText } from "../../../test/helpers/editor";
import { applyCellProperties } from "./cell-properties";

const buildCellData = (overrides: { element: string; scope?: string; width?: string }) => ({
  width: "",
  height: "",
  scope: "",
  horizontalAlign: "",
  verticalAlign: "",
  borderColor: "",
  backgroundColor: "",
  ...overrides,
});

describe("applyCellProperties", () => {
  let editor: Editor;
  let harness: EditorHarness;

  beforeEach(() => {
    harness = createEditorHarness();
    ({ editor } = harness);
  });

  afterEach(() => {
    harness.cleanup();
  });

  it("sets scope on a header cell", () => {
    editor.setContent(`<table><tbody><tr><th>h</th><td>b</td></tr></tbody></table>`);
    setTextSelectionByText(editor, "h");

    applyCellProperties(editor.tiptap, buildCellData({ element: "th", scope: "col" }));

    expect(editor.getContent()).toContain(`<th scope="col">h</th>`);
  });

  it("converts td to th and applies scope with a text cursor in the cell", () => {
    editor.setContent(`<table><tbody><tr><th>h</th><td>b</td></tr></tbody></table>`);
    setTextSelectionByText(editor, "b");

    applyCellProperties(editor.tiptap, buildCellData({ element: "th", scope: "row" }));

    expect(editor.getContent()).toContain(`<th scope="row">b</th>`);
  });

  it("converts th to td with a text cursor in the cell", () => {
    editor.setContent(`<table><tbody><tr><th>h</th><td>b</td></tr></tbody></table>`);
    setTextSelectionByText(editor, "h");

    applyCellProperties(editor.tiptap, buildCellData({ element: "td" }));

    expect(editor.getContent()).toContain(`<td>h</td>`);
  });

  it("applies scope to a td when the element stays td", () => {
    editor.setContent(`<table><tbody><tr><th>h</th><td>b</td></tr></tbody></table>`);
    setTextSelectionByText(editor, "b");

    applyCellProperties(editor.tiptap, buildCellData({ element: "td", scope: "row" }));

    expect(editor.getContent()).toContain(`<td scope="row">b</td>`);
  });

  it("clears scope when none is selected", () => {
    editor.setContent(`<table><tbody><tr><th scope="col">h</th><td>b</td></tr></tbody></table>`);
    setTextSelectionByText(editor, "h");

    applyCellProperties(editor.tiptap, buildCellData({ element: "th" }));

    expect(editor.getContent()).toContain(`<th>h</th>`);
  });

  it("applies style properties together with scope", () => {
    editor.setContent(`<table><tbody><tr><th>h</th><td>b</td></tr></tbody></table>`);
    setTextSelectionByText(editor, "b");

    applyCellProperties(
      editor.tiptap,
      buildCellData({ element: "th", scope: "row", width: "50%" })
    );

    expect(editor.getContent()).toContain(`<th scope="row" style="width: 50%;">b</th>`);
  });
});
