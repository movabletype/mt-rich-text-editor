import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import type {} from "../../src/mt-rich-text-editor";
import { mockEmbedObjectResolver, nextFrame, save } from "../util";

declare global {
  interface Window {
    pasteImageUploadCallCount: number;
  }
}

const PNG_1X1_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const dispatchPaste = (page: Page, html: string, text: string) =>
  page.evaluate(
    ({ html, text }) => {
      const clipboardData = new DataTransfer();
      clipboardData.setData("text/html", html);
      clipboardData.setData("text/plain", text);
      const pasteEvent = new ClipboardEvent("paste", {
        clipboardData,
      });
      const contenteditable = document
        .querySelector('[data-mt-rich-text-editor-id="editor"]')
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-content")
        ?.shadowRoot?.querySelector(`[contenteditable="true"]`);
      if (!contenteditable) {
        throw new Error("Editor contenteditable not found");
      }
      contenteditable.dispatchEvent(pasteEvent);
    },
    { html, text }
  );

const clickPasteMenuItem = (page: Page, name: "html" | "text") =>
  page.evaluate(
    ({ name }) => {
      const item = document
        .querySelector('[data-mt-rich-text-editor-id="editor"]')
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-content")
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-paste-menu")
        ?.shadowRoot?.querySelector<HTMLElement>(`mt-rich-text-editor-paste-menu-item-${name}`);
      if (!item) {
        throw new Error(`Paste menu item not found: ${name}`);
      }
      item.click();
    },
    { name }
  );

const getPasteMenuDisplay = (page: Page) =>
  page.evaluate(
    () =>
      document
        .querySelector('[data-mt-rich-text-editor-id="editor"]')
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-content")
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-paste-menu")
        ?.shadowRoot?.querySelector<HTMLElement>(".paste-menu")?.style.display
  );

const normalizeInterTagWhitespace = (content: string) => content.replace(/>\s+</g, "><");

const saveWithSortedAttributes = async (page: Page): Promise<string> => {
  const content = await save(page);
  return page.evaluate((content) => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    doc.body.querySelectorAll("*").forEach((el) => {
      const attrs = [...el.attributes]
        .map((a) => [a.name, a.value] as const)
        .sort(([a], [b]) => a.localeCompare(b));
      attrs.forEach(([name]) => el.removeAttribute(name));
      attrs.forEach(([name, value]) => el.setAttribute(name, value));
    });
    return doc.body.innerHTML;
  }, content);
};

test.describe("Paste Menu", () => {
  test("paste url", async ({ page }) => {
    await page.goto("/");
    await mockEmbedObjectResolver(page, async () => ({}));
    await page.locator('[data-mt-rich-text-editor-id="editor"]').click();
    await page.evaluate(() => {
      const clipboardData = new DataTransfer();
      clipboardData.setData("text/plain", "http://example.com");
      const pasteEvent = new ClipboardEvent("paste", {
        clipboardData,
      });
      document
        .querySelector('[data-mt-rich-text-editor-id="editor"]')
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-content")
        ?.shadowRoot?.querySelector(`[contenteditable="true"]`)
        ?.dispatchEvent(pasteEvent);
    });

    await expect
      .poll(() => save(page))
      .toBe(`<p><a href="http://example.com" target="_blank">http://example.com</a></p>`);

    await page.evaluate(() => {
      return document
        .querySelector('[data-mt-rich-text-editor-id="editor"]')
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-content")
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-paste-menu")
        ?.shadowRoot?.querySelector<HTMLElement>("mt-rich-text-editor-paste-menu-item-text")
        ?.click();
    });

    await expect.poll(() => save(page)).toBe(`<p>http://example.com</p>`);
  });

  test("paste url to selected text", async ({ page }) => {
    await page.goto("/");
    await mockEmbedObjectResolver(page, async () => ({}));
    await page.locator('[data-mt-rich-text-editor-id="editor"]').click();
    await page.keyboard.type("Test Link Text");

    await nextFrame(page);

    // Select "Link"
    for (let i = 0; i < " Text".length; i++) {
      await page.keyboard.press("ArrowLeft");
    }
    for (let i = 0; i < "Link".length; i++) {
      await page.keyboard.press("Shift+ArrowLeft");
    }

    await nextFrame(page);

    await page.evaluate(() => {
      const clipboardData = new DataTransfer();
      clipboardData.setData("text/plain", "http://example.com");
      const pasteEvent = new ClipboardEvent("paste", {
        clipboardData,
      });
      document
        .querySelector('[data-mt-rich-text-editor-id="editor"]')
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-content")
        ?.shadowRoot?.querySelector(`[contenteditable="true"]`)
        ?.dispatchEvent(pasteEvent);
    });

    await expect
      .poll(() => save(page))
      .toBe(`<p>Test <a href="http://example.com" target="_blank">Link</a> Text</p>`);

    await page.evaluate(() => {
      return document
        .querySelector('[data-mt-rich-text-editor-id="editor"]')
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-content")
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-paste-menu")
        ?.shadowRoot?.querySelector<HTMLElement>("mt-rich-text-editor-paste-menu-item-text")
        ?.click();
    });

    await expect.poll(() => save(page)).toBe(`<p>Test http://example.com Text</p>`);

    await page.evaluate(() => {
      return document
        .querySelector('[data-mt-rich-text-editor-id="editor"]')
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-content")
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-paste-menu")
        ?.shadowRoot?.querySelector<HTMLElement>("mt-rich-text-editor-paste-menu-item-link")
        ?.click();
    });
    await page.locator(".modal button.primary").click();

    await expect
      .poll(() => save(page))
      .toBe(`<p>Test <a href="http://example.com" target="_blank">Link</a> Text</p>`);
  });

  test("paste html with data url image without a file handler", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-mt-rich-text-editor-id="editor"]').click();

    await dispatchPaste(
      page,
      `<p>Hello</p><p><img src="data:image/png;base64,${PNG_1X1_BASE64}"></p>`,
      "Hello"
    );

    await expect.poll(() => save(page)).toBe("<p>Hello</p>");
  });

  test("resolves pasted data url images through fileHandler", async ({ page }) => {
    const expectedResolvedContent =
      '<p>before</p><p><img data-mt-asset-id="11" src="/one.png"></p><p>middle</p><p><img data-mt-asset-id="22" src="/two.png"></p><p>after</p>';
    const expectedPlainTextContent = "<p>before</p><p>middle</p><p>after</p>";
    const dataURL = `data:image/png;base64,${PNG_1X1_BASE64}`;

    await page.goto("/");
    await page.evaluate(() => {
      const editor = window.MTRichTextEditor.get({ id: "editor" });
      if (!editor) {
        throw new Error("Editor not found");
      }
      window.pasteImageUploadCallCount = 0;
      editor.options.extensionOptions = {
        ...editor.options.extensionOptions,
        fileHandler: {
          onPaste: (_tiptap, _files, _pasteContent, sessionId) => {
            window.pasteImageUploadCallCount += 1;
            window.setTimeout(() => {
              editor.tiptap.commands.applyUploadSessionResults(sessionId, [
                { index: 0, attributes: { src: "/one.png", "data-mt-asset-id": "11" } },
                { index: 1, attributes: { src: "/two.png", "data-mt-asset-id": "22" } },
              ]);
            }, 100);
          },
        },
      };
    });
    await page.locator('[data-mt-rich-text-editor-id="editor"]').click();

    await dispatchPaste(
      page,
      `<p>before</p><p><img src="${dataURL}"></p><p>middle</p><p><img src="${dataURL}"></p><p>after</p>`,
      "before\n\nmiddle\n\nafter"
    );

    await expect
      .poll(async () => normalizeInterTagWhitespace(await saveWithSortedAttributes(page)))
      .toBe(expectedResolvedContent);
    await expect.poll(() => getPasteMenuDisplay(page)).toBe("block");

    await clickPasteMenuItem(page, "text");
    await expect
      .poll(async () => normalizeInterTagWhitespace(await save(page)))
      .toBe(expectedPlainTextContent);

    await clickPasteMenuItem(page, "html");
    await expect
      .poll(async () => normalizeInterTagWhitespace(await saveWithSortedAttributes(page)))
      .toBe(expectedResolvedContent);
    expect(await page.evaluate(() => window.pasteImageUploadCallCount)).toBe(1);
  });
});
