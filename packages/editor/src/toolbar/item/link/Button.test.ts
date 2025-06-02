import { Editor } from "../../../editor";
import type { EditorOptions } from "../../../editor";
import type { ToolbarItemElement } from "../element";
import Button from "./Button.svelte";

window.customElements.define("mt-toolbar-item-link", Button.element!);

describe("Button", () => {
  let element: HTMLElement & ToolbarItemElement;
  let textarea: HTMLTextAreaElement;
  let editor: Editor;

  const initElement = (options: Partial<EditorOptions> = {}) => {
    if (element && element.parentNode) {
      element.remove();
    }
    element = document.createElement("mt-toolbar-item-link") as HTMLElement & ToolbarItemElement;

    if (textarea && textarea.parentNode) {
      editor.destroy();
      textarea.remove();
    }
    textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    editor = new Editor(textarea, {
      toolbar: [],
      inline: false,
      ...options,
    });

    if ("onEditorInit" in element) {
      element.onEditorInit(
        editor,
        (editor.options.toolbarOptions?.link || {}) as Record<string, unknown>
      );
    }

    document.body.appendChild(element);
  };

  beforeEach(() => {
    initElement();
  });

  afterEach(() => {
    document.querySelector<HTMLElement>(".modal")?.remove();
    element.remove();
    editor.destroy();
    textarea.remove();
  });

  describe("onClick", () => {
    it("should open modal with default target", async () => {
      await Promise.resolve();

      const clickEvent = new MouseEvent("click");
      element.dispatchEvent(clickEvent);

      await Promise.resolve();

      expect(document.querySelector<HTMLSelectElement>(`select[id="link-target"]`)?.value).toBe(
        "_self"
      );
    });

    it("should open modal with default target", async () => {
      initElement({
        toolbarOptions: {
          link: {
            defaultTarget: "_blank",
          },
        },
      });

      await Promise.resolve();

      const clickEvent = new MouseEvent("click");
      element.dispatchEvent(clickEvent);

      await Promise.resolve();

      expect(document.querySelector<HTMLSelectElement>(`select[id="link-target"]`)?.value).toBe(
        "_blank"
      );
    });
  });
});
