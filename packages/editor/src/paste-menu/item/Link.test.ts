import type { EditorOptions } from "../../editor";
import { flushMicrotasks, mountEditorElement } from "../../test/helpers/editor";
import type { MountedEditorElement } from "../../test/helpers/editor";
import type { PasteMenuItemElement } from "../item/element";
import Link from "./Link.svelte";

describe("Link", () => {
  let element: HTMLElement & PasteMenuItemElement;
  let harness: MountedEditorElement<HTMLElement & PasteMenuItemElement>;

  const initElement = (options: Partial<EditorOptions> = {}) => {
    harness?.cleanup();
    harness = mountEditorElement<HTMLElement & PasteMenuItemElement>({
      tagName: "mt-paste-menu-item-link",
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      elementClass: Link.element!,
      editorOptions: options,
    });
    ({ element } = harness);
  };

  beforeEach(() => {
    initElement();
  });

  afterEach(() => {
    harness.cleanup();
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
      await flushMicrotasks();

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
      await flushMicrotasks();

      element.content = {
        plainText: "https://example.com",
        htmlDocument: null,
        targetDomNode: null,
        clipboardData: new DataTransfer(),
        transaction: vi.fn(),
      };

      const clickEvent = new MouseEvent("click");
      element.dispatchEvent(clickEvent);

      await flushMicrotasks();

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

      await flushMicrotasks();

      element.content = {
        plainText: "https://example.com",
        htmlDocument: null,
        targetDomNode: null,
        clipboardData: new DataTransfer(),
        transaction: vi.fn(),
      };

      const clickEvent = new MouseEvent("click");
      element.dispatchEvent(clickEvent);

      await flushMicrotasks();

      expect(document.querySelector<HTMLSelectElement>(`select[id="link-target"]`)?.value).toBe(
        "_blank"
      );
    });
  });
});
