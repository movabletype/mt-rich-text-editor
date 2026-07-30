import { expect, test } from "@playwright/test";
import type {} from "../src/mt-rich-text-editor";
import { clickToolbarItem, open, save } from "./util";

test.describe("toolbar regressions", () => {
  test("applies bold to typed text", async ({ page }) => {
    await open(page, { content: "" });

    await page.locator('[data-mt-rich-text-editor-id="editor"]').click();
    await clickToolbarItem(page, "bold");
    await page.keyboard.type("Bold text");

    await expect.poll(() => save(page)).toBe("<p><strong>Bold text</strong></p>");
  });

  test("creates a link for the selected text", async ({ page }) => {
    await open(page, { content: "" });

    await page.locator('[data-mt-rich-text-editor-id="editor"]').click();
    await page.keyboard.type("Link");
    await page.evaluate(() => {
      window.MTRichTextEditor.get({ id: "editor" })!.tiptap.commands.selectAll();
    });

    await clickToolbarItem(page, "link");
    await page.locator("#link-url").fill("https://example.com");
    await page.locator(".modal button.primary").click();

    await expect
      .poll(() => save(page))
      .toBe(`<p><a href="https://example.com" target="_blank" title="">Link</a></p>`);
  });

  test("removes a link when unlink is pressed on linked text", async ({ page }) => {
    await open(page, {
      content: `<p><a href="https://example.com" target="_blank" title="">Link</a></p>`,
    });

    await page.locator('[data-mt-rich-text-editor-id="editor"]').getByText("Link").click();
    await clickToolbarItem(page, "unlink");

    await expect.poll(() => save(page)).toBe("<p>Link</p>");
  });

  test("toggles blockquote on the current paragraph", async ({ page }) => {
    await open(page, { content: "<p>Quote</p>" });

    await page.locator('[data-mt-rich-text-editor-id="editor"]').getByText("Quote").click();
    await clickToolbarItem(page, "blockquote");

    await expect.poll(() => save(page)).toBe(`<blockquote>
<p>Quote</p>
</blockquote>`);
  });
});
