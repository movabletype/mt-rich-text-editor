import { Editor } from "../editor";
import type { EditorOptions } from "../editor";
import type { MountedEditorElement } from "../test/helpers/editor";
import { flushMicrotasks, mountEditorElement, setTextSelection } from "../test/helpers/editor";
import type { ToolbarItemElement } from "../toolbar/item/element";
import LinkButton from "../toolbar/item/link/Button.svelte";

describe("ContextToolbar", () => {
  let editor: Editor;
  let harness: MountedEditorElement<HTMLElement & ToolbarItemElement>;

  const initElement = (options: Partial<EditorOptions> = {}) => {
    harness?.cleanup();
    harness = mountEditorElement<HTMLElement & ToolbarItemElement>({
      tagName: "mt-toolbar-item-link",
      elementClass: LinkButton.element!,
      editorOptions: options,
    });
    ({ editor } = harness);
  };

  const getContextToolbar = (): HTMLElement | null =>
    (editor.tiptap.view.dom.getRootNode() as ShadowRoot).querySelector<HTMLElement>(".toolbar");

  const rect: DOMRect = {
    top: 0,
    left: 0,
    right: 200,
    bottom: 20,
    width: 200,
    height: 20,
    x: 0,
    y: 0,
    toJSON() {
      return this;
    },
  };

  beforeEach(() => {
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue(rect);
  });

  afterEach(() => {
    harness.cleanup();
    vi.restoreAllMocks();
  });

  const setupLink = async (options: Partial<EditorOptions> = {}) => {
    initElement(options);
    editor.setContent(`<p><a href="https://example.com">Link text</a></p>`);
    await flushMicrotasks();
  };

  const selectWithinLink = async (empty: boolean) => {
    const from = editor.tiptap.state.doc.textContent.indexOf("Link") + 2;
    setTextSelection(editor, from, empty ? from : from + 2);
    await flushMicrotasks();
  };

  it("shows the toolbar for a non-empty selection in non-inline mode", async () => {
    await setupLink({ inline: false });
    await selectWithinLink(false);

    expect(getContextToolbar()?.style.display).toBe("flex");
  });

  it("shows the toolbar for an empty selection in non-inline mode", async () => {
    await setupLink({ inline: false });
    await selectWithinLink(true);

    expect(getContextToolbar()?.style.display).toBe("flex");
  });

  it("shows the toolbar for an empty selection in inline mode", async () => {
    await setupLink({ inline: true });
    await selectWithinLink(true);

    expect(getContextToolbar()?.style.display).toBe("flex");
  });

  it("hides the toolbar for a non-empty selection in inline mode", async () => {
    await setupLink({ inline: true });
    await selectWithinLink(false);

    expect(getContextToolbar()?.style.display).toBe("none");
  });
});
