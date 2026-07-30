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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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

  const createRect = ({
    top,
    left,
    width,
    height,
  }: {
    top: number;
    left: number;
    width: number;
    height: number;
  }): DOMRect => ({
    top,
    left,
    right: left + width,
    bottom: top + height,
    width,
    height,
    x: left,
    y: top,
    toJSON() {
      return this;
    },
  });

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

  const setupPosition = (targetLeft: number) => {
    const viewDom = editor.tiptap.view.dom;
    const targetDom = viewDom.querySelector("a");
    const toolbar = getContextToolbar();
    if (!targetDom || !toolbar) {
      throw new Error("Context toolbar test elements not found");
    }

    const viewRect = createRect({ top: 100, left: 100, width: 500, height: 300 });
    const targetRect = createRect({ top: 200, left: targetLeft, width: 40, height: 20 });
    vi.mocked(Element.prototype.getBoundingClientRect).mockImplementation(function (this: Element) {
      if (this === viewDom) {
        return viewRect;
      }
      if (this === targetDom) {
        return targetRect;
      }
      return rect;
    });
    Object.defineProperty(toolbar, "offsetWidth", { configurable: true, value: 200 });
    Object.defineProperty(toolbar, "offsetHeight", { configurable: true, value: 40 });
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

  it.each([
    ["left", 100, "0px", "-80px"],
    ["right", 560, "300px", "80px"],
  ])(
    "keeps the toolbar inside the editor and points its arrow at the target at the %s edge",
    async (_edge, targetLeft, expectedLeft, expectedArrowOffset) => {
      await setupLink();
      setupPosition(targetLeft);
      await selectWithinLink(true);

      const toolbar = getContextToolbar();
      expect(toolbar?.style.left).toBe(expectedLeft);
      expect(toolbar?.style.getPropertyValue("--arrow-offset")).toBe(expectedArrowOffset);
    }
  );
});
