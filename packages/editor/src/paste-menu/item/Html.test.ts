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
import {
  uploadSessionMetaKey,
  type UploadSessionMeta,
} from "../../tiptap/extension/upload-session";
import {
  UPLOAD_SESSION_ID_ATTRIBUTE,
  UPLOAD_SESSION_INDEX_ATTRIBUTE,
} from "../../tiptap/extension/upload-session/util";

type HtmlItemOptions = {
  keepDataAttributes?: boolean;
  handler?: (doc: Document) => void;
};

type ClipboardEventInitLike = EventInit & {
  clipboardData?: DataTransfer | null;
};

type OnPasteArgs = [
  editor: unknown,
  files: File[],
  pasteContent: string | undefined,
  sessionId: string,
];

const PNG_1X1_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

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

  const pasteDataURLImages = (sourceHTML: string) => {
    const onPaste = vi.fn();
    editor.options.extensionOptions = {
      ...editor.options.extensionOptions,
      fileHandler: { onPaste },
    };
    editor.setContent("<p>ab</p>");
    setTextSelection(editor, findTextPosition(editor, "ab", 2));
    element.content = createPasteContent(
      "image",
      new DOMParser().parseFromString(sourceHTML, "text/html")
    );

    element.onEditorPaste();

    expect(onPaste).toHaveBeenCalledTimes(1);
    const [, , , sessionId] = onPaste.mock.calls[0] as OnPasteArgs;
    return { onPaste, sessionId };
  };

  const captureUploadSessionMeta = () => {
    const listener = vi.fn<(meta: UploadSessionMeta) => void>();
    editor.tiptap.on("transaction", ({ transaction }) => {
      const meta = transaction.getMeta(uploadSessionMetaKey) as UploadSessionMeta | undefined;
      if (meta) {
        listener(meta);
      }
    });
    return listener;
  };

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
    it("preserves MT asset IDs while stripping other data attributes on auto-apply", () => {
      element.content = createPasteContent(
        "image",
        new DOMParser().parseFromString(
          '<p><img src="/asset.png" data-mt-asset-id="123" data-other="x"></p>',
          "text/html"
        )
      );

      element.onEditorPaste();

      const doc = new DOMParser().parseFromString(editor.getContent(), "text/html");
      const image = doc.body.querySelector('img[src="/asset.png"]');
      expect(image?.getAttribute("data-mt-asset-id")).toBe("123");
      expect(image?.hasAttribute("data-other")).toBe(false);
    });

    it("preserves data-mt-asset-id without showing it in the data attribute checklist", async () => {
      const handler = vi.fn();
      element.options.handler = handler;
      element.content = createPasteContent(
        "image",
        new DOMParser().parseFromString(
          '<p data-mt-indent="2"><img src="/asset.png" data-mt-asset-id="123" data-source="clipboard"></p>',
          "text/html"
        )
      );

      element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushMicrotasks();

      expect(document.querySelector('input[name="mtAssetId"]')).toBeNull();
      expect(document.querySelector('input[name="mtIndent"]')).not.toBeNull();
      expect(document.querySelector('input[name="source"]')).not.toBeNull();

      document.querySelector<HTMLElement>(".modal button.primary")?.click();

      const handledDocument = handler.mock.calls[0]?.[0] as Document | undefined;
      const image = handledDocument?.body.querySelector("img");
      expect(image?.getAttribute("data-mt-asset-id")).toBe("123");
      expect(handledDocument?.body.querySelector("p")?.hasAttribute("data-mt-indent")).toBe(false);
      expect(image?.hasAttribute("data-source")).toBe(false);
    });

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

    it("stamps pasted data URL images, hands them to the upload handler, and omits them from pending output", () => {
      const onPaste = vi.fn();
      editor.options.extensionOptions = {
        ...editor.options.extensionOptions,
        fileHandler: { onPaste },
      };
      const sourceHTML = `<p><img src="data:image/png;base64,${PNG_1X1_BASE64}"></p>`;
      editor.setContent("<p>ab</p>");
      setTextSelection(editor, findTextPosition(editor, "ab", 2));
      element.content = createPasteContent(
        "image",
        new DOMParser().parseFromString(sourceHTML, "text/html")
      );

      element.onEditorPaste();

      expect(onPaste).toHaveBeenCalledTimes(1);
      const [tiptapArg, filesArg, pasteContent, sessionId] = onPaste.mock.calls[0] as OnPasteArgs;
      expect(tiptapArg).toBe(editor.tiptap);
      expect(filesArg).toHaveLength(1);
      expect(filesArg[0].name).toBe("b2bbe763c7e1828c750d53f78550709a6fea19be.png");
      expect(filesArg[0].type).toBe("image/png");
      expect(sessionId).toMatch(/^upload-session-\d+$/);

      const expectedDocument = new DOMParser().parseFromString(sourceHTML, "text/html");
      const expectedImage = expectedDocument.body.querySelector("img")!;
      expectedImage.setAttribute(UPLOAD_SESSION_ID_ATTRIBUTE, sessionId);
      expectedImage.setAttribute(UPLOAD_SESSION_INDEX_ATTRIBUTE, "0");
      expect(pasteContent).toBe(editor.preprocessHTML(expectedDocument.body.innerHTML));

      const tiptapDocument = new DOMParser().parseFromString(editor.tiptap.getHTML(), "text/html");
      const tiptapImage = tiptapDocument.body.querySelector("img");
      expect(tiptapImage?.getAttribute(UPLOAD_SESSION_ID_ATTRIBUTE)).toBe(sessionId);
      expect(tiptapImage?.getAttribute(UPLOAD_SESSION_INDEX_ATTRIBUTE)).toBe("0");

      const outputDocument = new DOMParser().parseFromString(editor.getContent(), "text/html");
      const outputImage = outputDocument.body.querySelector("img");
      expect(outputImage).toBeNull();
    });

    it("re-applies updated uploads from the synchronized source without uploading again", () => {
      const { onPaste, sessionId } = pasteDataURLImages(
        `<p><img src="data:image/png;base64,${PNG_1X1_BASE64}"></p>`
      );

      editor.tiptap.commands.applyUploadSessionResults(sessionId, [
        { index: 0, attributes: { src: "/a.png", "data-mt-asset-id": "9" } },
      ]);
      element.onEditorPaste();

      expect(onPaste).toHaveBeenCalledTimes(1);
      const document = new DOMParser().parseFromString(editor.getContent(), "text/html");
      const images = [...document.images];
      expect(images).toHaveLength(1);
      expect(images[0].getAttribute("src")).toBe("/a.png");
      expect(images[0].getAttribute("data-mt-asset-id")).toBe("9");
      expect(images[0].hasAttribute(UPLOAD_SESSION_ID_ATTRIBUTE)).toBe(false);
      expect(images[0].hasAttribute(UPLOAD_SESSION_INDEX_ATTRIBUTE)).toBe(false);
    });

    it("reuses an upload session when the same content is re-applied", () => {
      const { onPaste, sessionId } = pasteDataURLImages(
        `<p><img src="data:image/png;base64,${PNG_1X1_BASE64}"></p>`
      );

      element.onEditorPaste();

      expect(onPaste).toHaveBeenCalledTimes(1);
      let document = new DOMParser().parseFromString(editor.tiptap.getHTML(), "text/html");
      let images = [...document.images];
      expect(images).toHaveLength(1);
      expect(images[0].getAttribute(UPLOAD_SESSION_ID_ATTRIBUTE)).toBe(sessionId);
      expect(images[0].getAttribute(UPLOAD_SESSION_INDEX_ATTRIBUTE)).toBe("0");

      editor.tiptap.commands.applyUploadSessionResults(sessionId, [
        { index: 0, attributes: { src: "/mid-session.png", "data-mt-asset-id": "10" } },
      ]);

      document = new DOMParser().parseFromString(editor.getContent(), "text/html");
      images = [...document.images];
      expect(images).toHaveLength(1);
      expect(images[0].getAttribute("src")).toBe("/mid-session.png");
      expect(images[0].getAttribute("data-mt-asset-id")).toBe("10");
      expect(images[0].hasAttribute(UPLOAD_SESSION_ID_ATTRIBUTE)).toBe(false);
      expect(images[0].hasAttribute(UPLOAD_SESSION_INDEX_ATTRIBUTE)).toBe(false);
    });

    it("ignores upload results from a different session", () => {
      const { onPaste, sessionId } = pasteDataURLImages(
        `<p><img src="data:image/png;base64,${PNG_1X1_BASE64}"></p>`
      );

      editor.tiptap.view.dispatch(
        editor.tiptap.state.tr.setMeta(uploadSessionMetaKey, {
          type: "apply",
          sessionId: "foreign-session",
          results: [{ index: 0, attributes: { src: "/foreign.png" } }],
          remaining: 0,
        } satisfies UploadSessionMeta)
      );
      element.onEditorPaste();

      expect(onPaste).toHaveBeenCalledTimes(1);
      let document = new DOMParser().parseFromString(editor.tiptap.getHTML(), "text/html");
      let image = document.body.querySelector("img")!;
      expect(image.getAttribute("src")).toContain("data:image/png;base64,");
      expect(image.getAttribute(UPLOAD_SESSION_ID_ATTRIBUTE)).toBe(sessionId);
      expect(image.getAttribute(UPLOAD_SESSION_INDEX_ATTRIBUTE)).toBe("0");

      editor.tiptap.commands.applyUploadSessionResults(sessionId, [
        { index: 0, attributes: { src: "/own-session.png" } },
      ]);

      document = new DOMParser().parseFromString(editor.getContent(), "text/html");
      image = document.body.querySelector("img")!;
      expect(image.getAttribute("src")).toBe("/own-session.png");
    });

    it("re-applies cancelled content without images or uploading again", () => {
      const source = `data:image/png;base64,${PNG_1X1_BASE64}`;
      const { onPaste, sessionId } = pasteDataURLImages(
        `<p>before</p><p><img src="${source}"></p><p>after</p>`
      );

      editor.tiptap.commands.cancelUploadSession(sessionId);
      const synchronizedDocument = element.content?.htmlDocument;
      expect(synchronizedDocument?.body.querySelector("img")).toBeNull();
      expect(
        [...(synchronizedDocument?.body.children ?? [])].map((child) => child.outerHTML)
      ).toEqual(["<p>before</p>", "<p>after</p>"]);

      element.onEditorPaste();

      expect(onPaste).toHaveBeenCalledTimes(1);
      for (const html of [editor.tiptap.getHTML(), editor.getContent()]) {
        const document = new DOMParser().parseFromString(html, "text/html");
        expect(document.body.querySelector("img")).toBeNull();
        expect(document.body.innerHTML).not.toContain(source);
        expect([...document.body.children].map((child) => child.outerHTML)).toEqual([
          "<p>before</p>",
          "<p>after</p>",
        ]);
      }
    });

    it("applies multiple upload results in place and records the applied results", () => {
      const sourceHTML = `<p>one<img src="data:image/png;base64,${PNG_1X1_BASE64}">middle<img src="data:image/png;base64,${PNG_1X1_BASE64}">two</p>`;
      const { sessionId } = pasteDataURLImages(sourceHTML);
      const updated = captureUploadSessionMeta();
      const results = [
        { index: 0, attributes: { src: "/one.png", "data-mt-asset-id": "11" } },
        { index: 1, attributes: { src: "/two.png", "data-mt-asset-id": "22" } },
      ];

      editor.tiptap.commands.applyUploadSessionResults(sessionId, results);

      const imageNodeAttrs: Record<string, unknown>[] = [];
      editor.tiptap.state.doc.descendants((node) => {
        if (node.type.name === "image") {
          imageNodeAttrs.push(node.attrs);
        }
      });
      expect(imageNodeAttrs[0].src).toBe("/one.png");
      expect(imageNodeAttrs[0].MTRichTextEditorHTMLAttributes).toMatchObject({
        "data-mt-asset-id": "11",
      });
      expect(imageNodeAttrs[0].MTRichTextEditorHTMLAttributes).not.toHaveProperty("src");

      const document = new DOMParser().parseFromString(editor.getContent(), "text/html");
      const paragraph = document.body.querySelector("p")!;
      const images = [...paragraph.querySelectorAll("img")];
      expect(images).toHaveLength(2);
      expect(images[0].getAttribute("src")).toBe("/one.png");
      expect(images[0].getAttribute("data-mt-asset-id")).toBe("11");
      expect(images[1].getAttribute("src")).toBe("/two.png");
      expect(images[1].getAttribute("data-mt-asset-id")).toBe("22");
      expect(paragraph.childNodes[0].textContent).toBe("one");
      expect(paragraph.childNodes[1]).toBe(images[0]);
      expect(paragraph.childNodes[2].textContent).toBe("middle");
      expect(paragraph.childNodes[3]).toBe(images[1]);
      expect(paragraph.childNodes[4].textContent).toBe("two");
      expect(document.body.querySelector(`[${UPLOAD_SESSION_ID_ATTRIBUTE}]`)).toBeNull();
      expect(document.body.querySelector(`[${UPLOAD_SESSION_INDEX_ATTRIBUTE}]`)).toBeNull();
      expect(updated).toHaveBeenCalledOnce();
      expect(updated).toHaveBeenCalledWith({
        type: "apply",
        sessionId,
        results,
        remaining: 0,
      });
    });

    it("applies upload results partially and out of order", () => {
      const sourceHTML = `<p><img src="data:image/png;base64,${PNG_1X1_BASE64}"><img src="data:image/png;base64,${PNG_1X1_BASE64}"></p>`;
      const { sessionId } = pasteDataURLImages(sourceHTML);
      const updated = captureUploadSessionMeta();

      editor.tiptap.commands.applyUploadSessionResults(sessionId, [
        { index: 99, attributes: { src: "/missing.png" } },
      ]);
      expect(updated).not.toHaveBeenCalled();

      const secondResult = { index: 1, attributes: { src: "/two.png" } };
      editor.tiptap.commands.applyUploadSessionResults(sessionId, [secondResult]);

      let document = new DOMParser().parseFromString(editor.tiptap.getHTML(), "text/html");
      let images = [...document.body.querySelectorAll("img")];
      expect(images[0].getAttribute(UPLOAD_SESSION_ID_ATTRIBUTE)).toBe(sessionId);
      expect(images[0].getAttribute(UPLOAD_SESSION_INDEX_ATTRIBUTE)).toBe("0");
      expect(images[1].getAttribute("src")).toBe("/two.png");
      expect(images[1].hasAttribute(UPLOAD_SESSION_ID_ATTRIBUTE)).toBe(false);
      expect(updated).toHaveBeenNthCalledWith(1, {
        type: "apply",
        sessionId,
        results: [secondResult],
        remaining: 1,
      });

      const firstResult = { index: 0, attributes: { src: "/one.png" } };
      editor.tiptap.commands.applyUploadSessionResults(sessionId, [firstResult]);

      document = new DOMParser().parseFromString(editor.tiptap.getHTML(), "text/html");
      images = [...document.body.querySelectorAll("img")];
      expect(images[0].getAttribute("src")).toBe("/one.png");
      expect(images[0].hasAttribute(UPLOAD_SESSION_ID_ATTRIBUTE)).toBe(false);
      expect(document.body.querySelector(`[${UPLOAD_SESSION_ID_ATTRIBUTE}]`)).toBeNull();
      expect(updated).toHaveBeenNthCalledWith(2, {
        type: "apply",
        sessionId,
        results: [firstResult],
        remaining: 0,
      });
    });

    it("preserves links and surrounding text while applying an upload result", () => {
      const sourceHTML = `<p>x <a href="/orig"><img src="data:image/png;base64,${PNG_1X1_BASE64}"></a> y</p>`;
      const { sessionId } = pasteDataURLImages(sourceHTML);

      editor.tiptap.commands.applyUploadSessionResults(sessionId, [
        { index: 0, attributes: { src: "/updated.png", "data-mt-asset-id": "31" } },
      ]);

      const document = new DOMParser().parseFromString(editor.getContent(), "text/html");
      const paragraph = document.body.querySelector("p")!;
      const link = paragraph.querySelector('a[href="/orig"]')!;
      const image = link.querySelector('img[src="/updated.png"]');
      expect(image?.getAttribute("data-mt-asset-id")).toBe("31");
      expect(link.children).toHaveLength(1);
      expect(paragraph.childNodes[0].textContent).toBe("x ");
      expect(paragraph.childNodes[1]).toBe(link);
      expect(paragraph.childNodes[2].textContent).toBe(" y");
    });

    it("cancels an upload session once by deleting images and their newly empty paragraph", () => {
      const source = `data:image/png;base64,${PNG_1X1_BASE64}`;
      const { sessionId } = pasteDataURLImages(
        `<p>before</p><p><img src="${source}"></p><p>after</p>`
      );
      const cancelled = captureUploadSessionMeta();

      editor.tiptap.commands.cancelUploadSession(sessionId);

      for (const html of [editor.tiptap.getHTML(), editor.getContent()]) {
        const document = new DOMParser().parseFromString(html, "text/html");
        expect(document.body.querySelector("img")).toBeNull();
        expect(document.body.innerHTML).not.toContain(source);
        expect([...document.body.children].map((child) => child.outerHTML)).toEqual([
          "<p>before</p>",
          "<p>after</p>",
        ]);
      }
      expect(cancelled).toHaveBeenCalledOnce();
      expect(cancelled).toHaveBeenCalledWith({ type: "cancel", sessionId });

      editor.tiptap.commands.cancelUploadSession(sessionId);
      expect(cancelled).toHaveBeenCalledOnce();
    });

    it("deletes multiple upload session images from one paragraph while preserving its text", () => {
      const source = `data:image/png;base64,${PNG_1X1_BASE64}`;
      const { sessionId } = pasteDataURLImages(
        `<p>a <img src="${source}"> b <img src="${source}"> c</p>`
      );

      editor.tiptap.commands.cancelUploadSession(sessionId);

      for (const html of [editor.tiptap.getHTML(), editor.getContent()]) {
        const document = new DOMParser().parseFromString(html, "text/html");
        expect(document.body.querySelector("img")).toBeNull();
        expect(document.body.innerHTML).not.toContain(source);
        expect(document.body.querySelector("p")?.textContent?.replace(/\s+/g, " ")).toBe("a b c");
      }
    });

    it("folds an upload result into the paste history step", () => {
      const sourceHTML = `<p>pasted<img src="data:image/png;base64,${PNG_1X1_BASE64}"></p>`;
      const { sessionId } = pasteDataURLImages(sourceHTML);
      editor.tiptap.commands.applyUploadSessionResults(sessionId, [
        { index: 0, attributes: { src: "/updated.png", "data-mt-asset-id": "41" } },
      ]);
      expect(editor.getContent()).toContain("/updated.png");

      expect(editor.tiptap.commands.undo()).toBe(true);

      expect(editor.getContent()).not.toContain("pasted");
      expect(editor.getContent()).not.toContain("<img");
    });

    it("folds cancellation into the paste history step", () => {
      const sourceHTML = `<p>pasted<img src="data:image/png;base64,${PNG_1X1_BASE64}"></p>`;
      const { sessionId } = pasteDataURLImages(sourceHTML);

      editor.tiptap.commands.cancelUploadSession(sessionId);
      expect(editor.getContent()).toContain("pasted");
      expect(editor.getContent()).not.toContain("<img");

      expect(editor.tiptap.commands.undo()).toBe(true);

      expect(editor.getContent()).not.toContain("pasted");
      expect(editor.getContent()).not.toContain("<img");
    });

    it("applies a result to every normally inserted duplicate of an upload session image", () => {
      const sourceHTML = `<p><img src="data:image/png;base64,${PNG_1X1_BASE64}"></p>`;
      const { sessionId } = pasteDataURLImages(sourceHTML);
      let uploadSessionImagePos = -1;
      editor.tiptap.state.doc.descendants((node, pos) => {
        if (node.type.name === "image") {
          uploadSessionImagePos = pos;
          return false;
        }
      });
      if (uploadSessionImagePos < 0) {
        throw new Error("Upload session image not found");
      }
      const uploadSessionImage = editor.tiptap.state.doc.nodeAt(uploadSessionImagePos);
      if (!uploadSessionImage) {
        throw new Error("Upload session image node not found");
      }
      editor.tiptap.view.dispatch(
        editor.tiptap.state.tr.insert(
          uploadSessionImagePos + uploadSessionImage.nodeSize,
          uploadSessionImage
        )
      );
      expect(
        new DOMParser().parseFromString(editor.tiptap.getHTML(), "text/html").images
      ).toHaveLength(2);

      editor.tiptap.commands.applyUploadSessionResults(sessionId, [
        { index: 0, attributes: { src: "/duplicate.png", "data-mt-asset-id": "51" } },
      ]);

      const document = new DOMParser().parseFromString(editor.getContent(), "text/html");
      const images = [...document.images];
      expect(images).toHaveLength(2);
      expect(images.every((image) => image.getAttribute("src") === "/duplicate.png")).toBe(true);
      expect(images.every((image) => image.getAttribute("data-mt-asset-id") === "51")).toBe(true);
      expect(document.body.querySelector(`[${UPLOAD_SESSION_ID_ATTRIBUTE}]`)).toBeNull();
    });

    it("removes pasted data URL images without throwing when fileHandler is not configured", () => {
      element.content = createPasteContent(
        "image",
        new DOMParser().parseFromString(
          `<p><img src="data:image/png;base64,${PNG_1X1_BASE64}"></p>`,
          "text/html"
        )
      );

      expect(() => element.onEditorPaste()).not.toThrow();

      expect(editor.tiptap.getHTML()).not.toContain("<img");
    });

    it("removes data URL images rejected by allowedMimeTypes without calling onPaste", () => {
      const onPaste = vi.fn();
      editor.options.extensionOptions = {
        ...editor.options.extensionOptions,
        fileHandler: { onPaste, allowedMimeTypes: ["image/jpeg"] },
      };
      element.content = createPasteContent(
        "image",
        new DOMParser().parseFromString(
          `<p><img src="data:image/png;base64,${PNG_1X1_BASE64}"></p>`,
          "text/html"
        )
      );

      element.onEditorPaste();

      expect(onPaste).not.toHaveBeenCalled();
      expect(editor.tiptap.getHTML()).not.toContain("<img");
    });

    it("leaves ProseMirror-internal data URL images untouched without calling onPaste", () => {
      const onPaste = vi.fn();
      editor.options.extensionOptions = {
        ...editor.options.extensionOptions,
        fileHandler: { onPaste },
      };
      element.content = createPasteContent(
        "image",
        new DOMParser().parseFromString(
          `<p data-pm-slice="1 1 []"><img src="data:image/png;base64,${PNG_1X1_BASE64}"></p>`,
          "text/html"
        )
      );

      element.onEditorPaste();

      expect(onPaste).not.toHaveBeenCalled();
      expect(editor.tiptap.getHTML()).toContain(`data:image/png;base64,${PNG_1X1_BASE64}`);
    });

    it("leaves https images untouched without calling fileHandler.onPaste", () => {
      const onPaste = vi.fn();
      editor.options.extensionOptions = {
        ...editor.options.extensionOptions,
        fileHandler: { onPaste },
      };
      element.content = createPasteContent(
        "image",
        new DOMParser().parseFromString(
          '<p><img src="https://example.com/image.png"></p>',
          "text/html"
        )
      );

      element.onEditorPaste();

      expect(onPaste).not.toHaveBeenCalled();
      const document = new DOMParser().parseFromString(editor.tiptap.getHTML(), "text/html");
      expect(
        document.body.querySelector('img[src="https://example.com/image.png"]')
      ).not.toBeNull();
    });
  });
});
