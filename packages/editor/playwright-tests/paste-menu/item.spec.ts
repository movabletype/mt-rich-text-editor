import { test, expect } from "@playwright/test";
import type {} from "../../src/mt-rich-text-editor";
import { mockEmbedObjectResolver } from "../util";

test.describe("Paste Menu", () => {
  test("paste url", async ({ page }) => {
    await page.goto("/");
    await mockEmbedObjectResolver(page, async () => ({}));
    const textarea = await page.locator("#editor");
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
    await new Promise((r) => setTimeout(r, 2300)); // wait for paste menu show

    await page.evaluate(async () => {
      await window.MTRichTextEditor.save();
    });
    const content1 = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
    expect(content1).toBe(
      `<p><a href="http://example.com" target="_blank">http://example.com</a></p>`
    );

    await page.evaluate(() => {
      return document
        .querySelector('[data-mt-rich-text-editor-id="editor"]')
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-content")
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-paste-menu")
        ?.shadowRoot?.querySelector<HTMLElement>("mt-rich-text-editor-paste-menu-item-text")
        ?.click();
    });

    await page.evaluate(async () => {
      await window.MTRichTextEditor.save();
    });
    const content2 = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
    expect(content2).toBe(`<p>http://example.com</p>`);
  });

  test("paste url to selected text", async ({ page }) => {
    await page.goto("/");
    await mockEmbedObjectResolver(page, async () => ({}));
    const textarea = await page.locator("#editor");
    await page.locator('[data-mt-rich-text-editor-id="editor"]').click();
    await page.keyboard.type("Test Link Text");

    // Select "Link"
    for (let i = 0; i < " Text".length; i++) {
      await page.keyboard.press("ArrowLeft");
    }
    for (let i = 0; i < "Link".length; i++) {
      await page.keyboard.press("Shift+ArrowLeft");
    }

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

    await page.evaluate(async () => {
      await window.MTRichTextEditor.save();
    });
    const content1 = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
    expect(content1).toBe(`<p>Test <a href="http://example.com" target="_blank">Link</a> Text</p>`);

    await page.evaluate(() => {
      return document
        .querySelector('[data-mt-rich-text-editor-id="editor"]')
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-content")
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-paste-menu")
        ?.shadowRoot?.querySelector<HTMLElement>("mt-rich-text-editor-paste-menu-item-text")
        ?.click();
    });

    await page.evaluate(async () => {
      await window.MTRichTextEditor.save();
    });
    const content2 = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
    expect(content2).toBe(`<p>Test http://example.com Text</p>`);

    await page.evaluate(() => {
      return document
        .querySelector('[data-mt-rich-text-editor-id="editor"]')
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-content")
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-paste-menu")
        ?.shadowRoot?.querySelector<HTMLElement>("mt-rich-text-editor-paste-menu-item-link")
        ?.click();
    });
    await page.locator(".modal button.primary").click();

    await page.evaluate(async () => {
      await window.MTRichTextEditor.save();
    });
    const content3 = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
    expect(content3).toBe(`<p>Test <a href="http://example.com" target="_blank">Link</a> Text</p>`);
  });
});
