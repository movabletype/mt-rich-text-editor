import { Editor } from "../editor";
import type { EditorHarness } from "../test/helpers/editor";
import {
  createEditorHarness,
  flushMicrotasks,
  normalizeComparableHTML,
  setTextSelectionByText,
} from "../test/helpers/editor";

describe("StructureMode onSubmit attribute routing", () => {
  let harness: EditorHarness;
  let editor: Editor;

  beforeEach(() => {
    harness = createEditorHarness();
    ({ editor } = harness);
  });

  afterEach(() => {
    editor.setStructureMode(false);
    harness.cleanup();
  });

  const openModalForParagraph = async () => {
    editor.setStructureMode(true);

    const domNode = editor.tiptap.view.dom.querySelector("p");
    expect(domNode).not.toBeNull();

    domNode!.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    await flushMicrotasks();

    expect(document.querySelector<HTMLInputElement>("#structure-style")).not.toBeNull();
  };

  const setModalValue = (id: string, value: string) => {
    const input = document.querySelector<HTMLInputElement>(`#${id}`);
    expect(input).not.toBeNull();
    input!.value = value;
    input!.dispatchEvent(new Event("input"));
  };

  const submitModal = async () => {
    document.querySelector<HTMLButtonElement>(".modal button.primary")?.click();
    await flushMicrotasks();
  };

  it("routes an edited padding-left declaration to the indent attribute", async () => {
    editor.setContent(`<p style="padding-left: 80px; color: red;">t</p>`);

    await openModalForParagraph();
    setModalValue("structure-style", "padding-left: 160px; color: red");
    await submitModal();

    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML(`<p style="padding-left: 160px; color: red">t</p>`)
    );

    // The indent attribute stays usable by the indent/outdent commands afterward.
    setTextSelectionByText(editor, "t");
    editor.tiptap.chain().focus().outdent().run();
    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML(`<p style="padding-left: 80px; color: red">t</p>`)
    );
  });

  it("routes a valid text-align declaration to the textAlign attribute", async () => {
    editor.setContent(`<p style="text-align: center;">t</p>`);

    await openModalForParagraph();
    setModalValue("structure-style", "text-align: right");
    await submitModal();

    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML(`<p style="text-align: right">t</p>`)
    );
  });

  it("leaves an invalid text-align value in the verbatim style", async () => {
    editor.setContent(`<p>t</p>`);

    await openModalForParagraph();
    setModalValue("structure-style", "text-align: diagonal");
    await submitModal();

    // Asserted against the model attrs rather than rendered HTML: ProseMirror's
    // NodeView update path applies style changes via `element.style.cssText`,
    // which runs invalid CSS values (like this deliberately-bogus text-align)
    // through the browser's CSSOM validation and drops them - a DOM-serialization
    // quirk unrelated to the routing logic under test here.
    const paragraph = editor.tiptap.state.doc.firstChild;
    const htmlAttributes = paragraph?.attrs.MTRichTextEditorHTMLAttributes as
      { style?: string } | undefined;
    expect(htmlAttributes?.style).toBe("text-align: diagonal");
    expect(paragraph?.attrs.textAlign).toBe("");
  });

  it("updates id and class alongside the routed style declarations", async () => {
    editor.setContent(`<p>t</p>`);

    await openModalForParagraph();
    setModalValue("structure-id", "my-id");
    setModalValue("structure-class-name", "my-class");
    setModalValue("structure-style", "padding-left: 80px");
    await submitModal();

    expect(normalizeComparableHTML(editor.getContent())).toBe(
      normalizeComparableHTML(`<p id="my-id" class="my-class" style="padding-left: 80px">t</p>`)
    );
  });
});
