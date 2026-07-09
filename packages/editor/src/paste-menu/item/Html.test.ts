import { Editor } from "../../editor";
import type { EditorOptions } from "../../editor";
import {
  findTextPosition,
  flushMicrotasks,
  mountEditorElement,
  setTextSelection,
} from "../../test/helpers/editor";
import type { MountedEditorElement } from "../../test/helpers/editor";
import type { PasteMenuItemElement } from "./element";
import Html from "./Html.svelte";

type HtmlItemOptions = {
  keepDataAttributes?: boolean;
  handler?: (doc: Document) => void;
};

type ClipboardEventInitLike = EventInit & {
  clipboardData?: DataTransfer | null;
};

describe("Html", () => {
  let element: HTMLElement & PasteMenuItemElement;
  let editor: Editor;
  let harness: MountedEditorElement<HTMLElement & PasteMenuItemElement, HtmlItemOptions>;
  const originalClipboardEvent = globalThis.ClipboardEvent;

  const initElement = (
    editorOptions: Partial<EditorOptions> = {},
    itemOptions: HtmlItemOptions = {}
  ) => {
    harness?.cleanup();
    harness = mountEditorElement<HTMLElement & PasteMenuItemElement, HtmlItemOptions>({
      tagName: "mt-paste-menu-item-html",
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      elementClass: Html.element!,
      editorOptions,
      getInitOptions: () => itemOptions,
    });
    ({ element, editor } = harness);
  };

  const createPasteContent = (plainText: string, htmlDocument: Document | null = null) => ({
    plainText,
    htmlDocument,
    targetDomNode: null,
    clipboardData: new DataTransfer(),
    transaction: (cb: () => void | Promise<void>) => cb(),
  });

  beforeEach(() => {
    if (!globalThis.ClipboardEvent) {
      class MockClipboardEvent extends Event {
        clipboardData: DataTransfer | null;

        constructor(type: string, init: ClipboardEventInitLike = {}) {
          super(type, init);
          this.clipboardData = init.clipboardData ?? null;
        }
      }

      vi.stubGlobal("ClipboardEvent", MockClipboardEvent);
    }
    initElement();
  });

  afterEach(() => {
    harness.cleanup();
    if (!originalClipboardEvent) {
      vi.unstubAllGlobals();
    }
  });

  describe("isEditorItemAvailable", () => {
    it("returns false when content is undefined", () => {
      element.content = undefined;

      expect(element.isEditorItemAvailable()).toBe(false);
    });

    it("returns false for placeholder-like plain text", () => {
      element.content = createPasteContent("<placeholder>");

      expect(element.isEditorItemAvailable()).toBe(false);
    });

    it("returns true when htmlDocument has HTML content", () => {
      element.content = createPasteContent(
        "test",
        new DOMParser().parseFromString("<p><strong>test</strong></p>", "text/html")
      );

      expect(element.isEditorItemAvailable()).toBe(true);
    });

    it.each([
      "<hr>",
      '<iframe src="https://example.com/embed"></iframe>',
      '<div data-embed="1"></div>',
    ])("returns true for HTML-like plain text snippets: %s", (content) => {
      element.content = createPasteContent(content);

      expect(element.isEditorItemAvailable()).toBe(true);
    });

    it.each(["<my-widget></my-widget>", "<Foo-Bar />", "<mt:embed></mt:embed>"])(
      "returns false for custom-element-like plain text snippets: %s",
      (content) => {
        element.content = createPasteContent(content);

        expect(element.isEditorItemAvailable()).toBe(false);
      }
    );
  });

  describe("apply", () => {
    it("clicking the item applies plain-text HTML immediately without opening the modal", async () => {
      editor.setContent("<p>ab</p>");
      setTextSelection(editor, findTextPosition(editor, "ab", 1));
      element.content = createPasteContent('<a href="https://example.com" target="_self">x</a>');

      element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushMicrotasks();

      const doc = new DOMParser().parseFromString(editor.tiptap.getHTML(), "text/html");
      const link = doc.body.querySelector('a[href="https://example.com"]');

      expect(document.querySelector(".modal")).toBeNull();
      expect(link?.textContent).toBe("x");
      expect(doc.body.textContent).toBe("x");
    });

    it("inserts plain-text HTML with text content through the HTML paste path", () => {
      editor.setContent("<p>ab</p>");
      setTextSelection(editor, findTextPosition(editor, "ab", 1));
      element.content = createPasteContent("<strong>x</strong>");

      element.onEditorPaste();

      const doc = new DOMParser().parseFromString(editor.tiptap.getHTML(), "text/html");
      const strong = doc.body.querySelector("strong");

      expect(strong?.textContent).toBe("x");
      expect(doc.body.textContent).toBe("x");
    });

    it("inserts element-only plain-text HTML snippets without leaving the sentinel behind", () => {
      editor.setContent("<p>ab</p>");
      setTextSelection(editor, findTextPosition(editor, "ab", 1));
      element.content = createPasteContent("<hr>");

      element.onEditorPaste();

      const html = editor.tiptap.getHTML();
      const doc = new DOMParser().parseFromString(html, "text/html");

      expect(doc.body.querySelector("hr")).not.toBeNull();
      expect(html).not.toContain("data-paste-html-sentinel");
      expect(html).not.toContain("\u200B");
    });

    it("keeps trusted attributes in the direct plain-text HTML path", () => {
      const handler = vi.fn();
      element.options.handler = handler;
      element.content = createPasteContent(
        `<script src="/embed.js" data-attribute='{"key":"value"}'></script>`
      );

      element.onEditorPaste();

      const handledDocument = handler.mock.calls[0]?.[0] as Document | undefined;
      const script = handledDocument?.body.querySelector("script");

      expect(handler).toHaveBeenCalledTimes(1);
      expect(script?.getAttribute("src")).toBe("/embed.js");
      expect(script?.getAttribute("data-attribute")).toBe('{"key":"value"}');
    });
  });
});
