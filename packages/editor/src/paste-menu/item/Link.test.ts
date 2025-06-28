import { Editor } from "../../editor";
import type { EditorOptions } from "../../editor";
import type { PasteMenuItemElement } from "../item/element";
import Link from "./Link.svelte";

window.customElements.define("mt-paste-menu-item-link", Link.element!);

describe("Link", () => {
  let element: HTMLElement & PasteMenuItemElement;
  let textarea: HTMLTextAreaElement;
  let editor: Editor;

  const initElement = (options: Partial<EditorOptions> = {}) => {
    if (element && element.parentNode) {
      element.remove();
    }
    element = document.createElement("mt-paste-menu-item-link") as HTMLElement &
      PasteMenuItemElement;

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
      element.onEditorInit(editor, {});
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

  describe("isEditorItemAvailable", () => {
    it("should return true for valid URLs", () => {
      element.content = {
        plainText: "https://example.com",
        htmlDocument: null,
        targetDomNode: null,
        clipboardData: new DataTransfer(),
        transaction: vi.fn(),
      };
      expect(element.isEditorItemAvailable()).toBe(true);
    });

    it("should return false for invalid URLs", () => {
      element.content = {
        plainText: "not a url",
        htmlDocument: null,
        targetDomNode: null,
        clipboardData: new DataTransfer(),
        transaction: vi.fn(),
      };
      expect(element.isEditorItemAvailable()).toBe(false);
    });

    it("should return false when content is undefined", () => {
      element.content = undefined;
      expect(element.isEditorItemAvailable()).toBe(false);
    });
  });

  describe("apply", () => {
    it("should create and insert a link element", () => {
      const mockInsertContent = vi.fn();
      element.insertContent = mockInsertContent;
      element.content = {
        plainText: "https://example.com",
        htmlDocument: null,
        targetDomNode: null,
        clipboardData: new DataTransfer(),
        transaction: vi.fn(),
      };

      element.onEditorPaste();

      expect(mockInsertContent).toHaveBeenCalledWith(
        '<a href="https://example.com" target="_self">https://example.com</a>'
      );
    });

    it("should create and insert a link element with default target", async () => {
      initElement({
        toolbarOptions: {
          link: {
            defaultTarget: "_blank",
          },
        },
      });
      await Promise.resolve(); // wait for custom element to be initialized

      const mockInsertContent = vi.fn();
      element.insertContent = mockInsertContent;
      element.content = {
        plainText: "https://example.com",
        htmlDocument: null,
        targetDomNode: null,
        clipboardData: new DataTransfer(),
        transaction: vi.fn(),
      };

      element.onEditorPaste();

      expect(mockInsertContent).toHaveBeenCalledWith(
        '<a href="https://example.com" target="_blank">https://example.com</a>'
      );
    });
  });

  describe("edit", () => {
    it("should open modal without default target", async () => {
      await Promise.resolve();

      element.content = {
        plainText: "https://example.com",
        htmlDocument: null,
        targetDomNode: null,
        clipboardData: new DataTransfer(),
        transaction: vi.fn(),
      };

      const clickEvent = new MouseEvent("click");
      element.dispatchEvent(clickEvent);

      await Promise.resolve();

      expect(document.querySelector<HTMLSelectElement>(`select[id="link-target"]`)?.value).toBe(
        "_self"
      );
    });

    it("should open modal with default target _blank", async () => {
      initElement({
        toolbarOptions: {
          link: {
            defaultTarget: "_blank",
          },
        },
      });

      await Promise.resolve();

      element.content = {
        plainText: "https://example.com",
        htmlDocument: null,
        targetDomNode: null,
        clipboardData: new DataTransfer(),
        transaction: vi.fn(),
      };

      const clickEvent = new MouseEvent("click");
      element.dispatchEvent(clickEvent);

      await Promise.resolve();

      expect(document.querySelector<HTMLSelectElement>(`select[id="link-target"]`)?.value).toBe(
        "_blank"
      );
    });
  });
});
