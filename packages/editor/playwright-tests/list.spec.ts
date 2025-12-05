import { test, expect } from "@playwright/test";
import type {} from "../src/mt-rich-text-editor";

test.describe("EditorManager", () => {
  test("insert list by inputRules", async ({ page }) => {
    await page.goto("/");
    const textarea = await page.locator("#editor");
    await page.locator('[data-mt-rich-text-editor-id="editor"]').click();
    await page.keyboard.type("* test");
    await page.evaluate(async () => {
      await window.MTRichTextEditor.save();
    });

    const content = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
    expect(content).toBe(`<ul>
<li>test</li>
</ul>`);
  });

  test("preserve existing 'ul > li > p' structure", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      window.MTRichTextEditor.get({ id: "editor" })!.setContent(`<ul>
<li><p>test</p></li>
</ul>`);
    });
    const textarea = await page.locator("#editor");
    await page.locator('[data-mt-rich-text-editor-id="editor"]').click();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.type("paragraph");
    await page.keyboard.press("Enter");
    await page.keyboard.type("* new item");
    await page.evaluate(async () => {
      await window.MTRichTextEditor.save();
    });

    const content = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
    expect(content).toBe(`<ul>
<li>
<p>test</p>
</li>
</ul>
<p>paragraph</p>
<ul>
<li>new item</li>
</ul>`);
  });

  test("cancel list by pressing Enter twice", async ({ page }) => {
    await page.goto("/");
    const textarea = await page.locator("#editor");
    await page.locator('[data-mt-rich-text-editor-id="editor"]').click();
    await page.keyboard.type("* test");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.type("test paragraph");
    await page.evaluate(async () => {
      await window.MTRichTextEditor.save();
    });

    const content = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
    expect(content).toBe(`<ul>
<li>test</li>
</ul>
<p>test paragraph</p>`);
  });

  test("prevent insert paragraph when delete key on docs", async ({ page }) => {
    await page.goto("/");
    const textarea = await page.locator("#editor");
    await page.locator('[data-mt-rich-text-editor-id="editor"]').click();
    await page.keyboard.type("* test");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await new Promise((r) => setTimeout(r, 50));
    await page.keyboard.press("Backspace");
    await new Promise((r) => setTimeout(r, 50));
    await page.keyboard.type("next");
    await page.evaluate(async () => {
      await window.MTRichTextEditor.save();
    });

    const content = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
    expect(content).toBe(`<ul>
<li>test</li>
<li>next</li>
</ul>`);
  });

  test("The problem of generating empty textBlocks has been resolved", async ({ page }) => {
    await page.goto("/");
    const textarea = await page.locator("#editor");
    await page.locator('[data-mt-rich-text-editor-id="editor"]').click();
    await page.keyboard.type("* test");
    await page.keyboard.press("Enter");
    await page.keyboard.type("x");
    await new Promise((r) => setTimeout(r, 50));
    await page.keyboard.press("Backspace"); // Delete the "x"
    await page.keyboard.press("Backspace"); // Delete second list item
    await new Promise((r) => setTimeout(r, 50));
    await page.keyboard.press("Enter"); // Add a new list item
    await new Promise((r) => setTimeout(r, 50));
    await page.keyboard.type("next");
    await page.evaluate(async () => {
      await window.MTRichTextEditor.save();
    });

    const content = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
    expect(content).toBe(`<ul>
<li>test</li>
<li>next</li>
</ul>`);
  });
});
