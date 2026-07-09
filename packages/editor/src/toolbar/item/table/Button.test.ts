import { Editor } from "../../../editor";
import type { EditorOptions } from "../../../editor";
import type { MountedEditorElement } from "../../../test/helpers/editor";
import {
  flushMicrotasks,
  mountEditorElement,
  normalizeComparableHTML,
} from "../../../test/helpers/editor";
import type { ToolbarItemElement } from "../element";
import Button from "./Button.svelte";

describe("table Button", () => {
  let element: HTMLElement & ToolbarItemElement;
  let editor: Editor;
  let harness: MountedEditorElement<HTMLElement & ToolbarItemElement>;

  const initElement = (options: Partial<EditorOptions> = {}) => {
    harness?.cleanup();
    harness = mountEditorElement<HTMLElement & ToolbarItemElement>({
      tagName: "mt-toolbar-item-table",
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      elementClass: Button.element!,
      editorOptions: options,
      getInitOptions: (mountedEditor) =>
        (mountedEditor.options.toolbarOptions?.table || {}) as Record<string, unknown>,
    });
    ({ element, editor } = harness);
  };

  afterEach(() => {
    harness?.cleanup();
  });

  // Opens the insert-table panel, reveals its "insert" submenu, hovers the cell at the given
  // (0-indexed) row/col to select a rows x cols grid, then clicks it to trigger the insert.
  const insertTableViaUI = async (rowIndex: number, colIndex: number) => {
    element.dispatchEvent(new MouseEvent("click"));
    await flushMicrotasks();

    const insertGroup = element.shadowRoot!.querySelector<HTMLElement>(
      ".button-menu-item-group--insert"
    );
    expect(insertGroup).not.toBeNull();
    insertGroup!.dispatchEvent(new MouseEvent("mouseenter"));
    await flushMicrotasks();

    const rows = insertGroup!.querySelectorAll<HTMLElement>(".grid_row");
    const targetCell = rows[rowIndex]?.querySelectorAll<HTMLElement>(".grid_cell")[colIndex];
    expect(targetCell).toBeDefined();
    targetCell!.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    await flushMicrotasks();
    targetCell!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await flushMicrotasks();
  };

  beforeEach(() => {
    initElement();
  });

  it("inserts a table with the default attributes when no toolbarOptions.table is given", async () => {
    await flushMicrotasks();
    await insertTableViaUI(1, 2);

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

  it("applies toolbarOptions.table.initialAttributes when inserting via the toolbar UI", async () => {
    initElement({
      toolbarOptions: {
        table: {
          initialAttributes: { class: "my-table", style: "width: 50%;" },
        },
      },
    });
    await flushMicrotasks();

    await insertTableViaUI(1, 2);

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
});
