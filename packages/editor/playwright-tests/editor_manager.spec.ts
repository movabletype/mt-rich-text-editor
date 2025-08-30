import { test, expect } from "@playwright/test";
import type {} from "../src/mt-rich-text-editor";

test.describe("EditorManager", () => {
  test("initialize", async ({ page }) => {
    await page.goto("/");
    const editorExists = await page.locator('[data-mt-rich-text-editor-id="editor"]').isVisible();
    expect(editorExists).toBeTruthy();
  });

  test("edit", async ({ page }) => {
    await page.goto("/");
    const textarea = await page.locator("#editor");
    await page.locator('[data-mt-rich-text-editor-id="editor"]').click();
    await page.keyboard.type("Test text");
    await page.evaluate(async () => {
      await window.MTRichTextEditor.save();
    });

    const content = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
    expect(content).toBe("<p>Test text</p>");
  });
});
