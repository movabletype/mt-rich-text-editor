import type { EditorOptions } from "../../../editor";
import type { MountedEditorElement } from "../../../test/helpers/editor";
import { mountEditorElement } from "../../../test/helpers/editor";
import type { ToolbarItemElement } from "../element";
import Button from "./Button.svelte";

describe("Button", () => {
  let element: HTMLElement & ToolbarItemElement;
  let harness: MountedEditorElement<HTMLElement & ToolbarItemElement>;

  const boilerplateHTML = `<p class="highlight">Hello</p>`;
  const contentStylesheet = ".highlight { color: red }";

  const initElement = (options: Partial<EditorOptions> = {}) => {
    harness?.cleanup();
    harness = mountEditorElement<HTMLElement & ToolbarItemElement>({
      tagName: "mt-toolbar-item-boilerplate",
      elementClass: Button.element!,
      editorOptions: options,
      getInitOptions: (mountedEditor) =>
        (mountedEditor.options.toolbarOptions?.boilerplate || {}) as Record<string, unknown>,
    });
    ({ element } = harness);
  };

  const openModal = async (): Promise<HTMLElement> => {
    element.dispatchEvent(new MouseEvent("click"));
    return await vi.waitFor(() => {
      const el = document.querySelector<HTMLElement>("#boilerplate_text");
      expect(el).not.toBeNull();
      return el!;
    });
  };

  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        text: () => Promise.resolve(boilerplateHTML),
      })
    );

    initElement({
      toolbarOptions: {
        boilerplate: {
          boilerplates: [
            { title: "Example", url: "https://example.com/boilerplate/1", description: "" },
          ],
        },
      },
      stylesheets: [contentStylesheet],
      classNames: ["entry-body"],
    });
  });

  afterEach(() => {
    harness.cleanup();
    vi.unstubAllGlobals();
  });

  describe("onClick", () => {
    it("should apply content stylesheets and class names to the preview", async () => {
      const previewEl = await openModal();

      const shadow = previewEl.shadowRoot;
      expect(shadow).not.toBeNull();

      const styles = [...shadow!.querySelectorAll("style")].map((style) => style.textContent);
      expect(styles).toContain(contentStylesheet);

      const content = shadow!.querySelector("div");
      expect(content?.className).toBe("entry-body");
      expect(content?.innerHTML).toBe(boilerplateHTML);
    });

    it("should insert the selected boilerplate into the editor", async () => {
      await openModal();

      document.querySelector<HTMLButtonElement>(".modal button.primary")?.click();

      expect(harness.editor.getContent()).toBe(boilerplateHTML);
    });
  });
});
