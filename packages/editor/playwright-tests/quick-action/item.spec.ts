import { test, expect } from "@playwright/test";
import type {} from "../../src/mt-rich-text-editor";

test.describe("Quick Action", () => {
  test("heading 1", async ({ page }) => {
    await page.goto("/");
    const textarea = await page.locator("#editor");
    await page.locator('[data-mt-rich-text-editor-id="editor"]').click();
    await page.keyboard.type("/h");
    await new Promise((r) => setTimeout(r, 500)); // Wait for commit undo history
    await page.keyboard.type("1");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Heading 1");
    await page.evaluate(async () => {
      await window.MTRichTextEditor.save();
    });

    const content = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
    expect(content).toBe("<h1>Heading 1</h1>");
  });
});
