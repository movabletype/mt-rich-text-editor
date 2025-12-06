import { test, expect } from "@playwright/test";
import type {} from "../src/mt-rich-text-editor";
import { clickToolbarItem } from "./util";

test.describe("indent extension", () => {
  test("apply indent", async ({ page }) => {
    await page.goto("/");
    const textarea = await page.locator("#editor");
    await page.locator('[data-mt-rich-text-editor-id="editor"]').click();
    await page.keyboard.type("1st row");
    await page.keyboard.press("Enter");
    await clickToolbarItem(page, "indent");
    await page.keyboard.type("2nd row");

    await page.evaluate(async () => {
      await window.MTRichTextEditor.save();
    });

    const content = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
    expect(content).toBe(`<p>1st row</p>
<p style="padding-left: 80px">2nd row</p>`);
  });

  test("apply multi level indent", async ({ page }) => {
    await page.goto("/");
    const textarea = await page.locator("#editor");
    await page.locator('[data-mt-rich-text-editor-id="editor"]').click();
    await page.keyboard.type("1st row");
    await page.keyboard.press("Enter");
    await clickToolbarItem(page, "indent");
    await clickToolbarItem(page, "indent");
    await page.keyboard.type("2nd row");

    await page.evaluate(async () => {
      await window.MTRichTextEditor.save();
    });

    const content = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
    expect(content).toBe(`<p>1st row</p>
<p style="padding-left: 160px">2nd row</p>`);
  });

  test("apply indent and outdent", async ({ page }) => {
    await page.goto("/");
    const textarea = await page.locator("#editor");
    await page.locator('[data-mt-rich-text-editor-id="editor"]').click();
    await page.keyboard.type("1st row");
    await page.keyboard.press("Enter");
    await clickToolbarItem(page, "indent");
    await clickToolbarItem(page, "outdent");
    await page.keyboard.type("2nd row");

    await page.evaluate(async () => {
      await window.MTRichTextEditor.save();
    });

    const content = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
    expect(content).toBe(`<p>1st row</p>
<p>2nd row</p>`);
  });

  test("apply multi level indent and outdent", async ({ page }) => {
    await page.goto("/");
    const textarea = await page.locator("#editor");
    await page.locator('[data-mt-rich-text-editor-id="editor"]').click();
    await page.keyboard.type("1st row");
    await page.keyboard.press("Enter");
    await clickToolbarItem(page, "indent");
    await clickToolbarItem(page, "indent");
    await clickToolbarItem(page, "outdent");
    await page.keyboard.type("2nd row");

    await page.evaluate(async () => {
      await window.MTRichTextEditor.save();
    });

    const content = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
    expect(content).toBe(`<p>1st row</p>
<p style="padding-left: 80px">2nd row</p>`);
  });

  test("outdent does not go below zero", async ({ page }) => {
    await page.goto("/");
    const textarea = await page.locator("#editor");
    await page.locator('[data-mt-rich-text-editor-id="editor"]').click();
    await page.keyboard.type("1st row");
    await page.keyboard.press("Enter");
    await clickToolbarItem(page, "outdent");
    await page.keyboard.type("2nd row");

    await page.evaluate(async () => {
      await window.MTRichTextEditor.save();
    });

    const content = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
    expect(content).toBe(`<p>1st row</p>
<p>2nd row</p>`);
  });

  test("apply indent to list item", async ({ page }) => {
    await page.goto("/");
    const textarea = await page.locator("#editor");
    await page.locator('[data-mt-rich-text-editor-id="editor"]').click();
    await clickToolbarItem(page, "bulletList");
    await page.keyboard.type("List item 1");
    await page.keyboard.press("Enter");
    await page.keyboard.type("List item 2");
    await page.keyboard.press("Enter");
    await clickToolbarItem(page, "indent");
    await page.keyboard.type("List item 2.1");

    await page.evaluate(async () => {
      await window.MTRichTextEditor.save();
    });

    const content = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
    expect(content).toBe(`<ul>
<li>List item 1</li>
<li>List item 2<ul>
<li>List item 2.1</li>
</ul>
</li>
</ul>`);
  });

  test("apply indent and outdent to list item", async ({ page }) => {
    await page.goto("/");
    const textarea = await page.locator("#editor");
    await page.locator('[data-mt-rich-text-editor-id="editor"]').click();
    await clickToolbarItem(page, "bulletList");
    await page.keyboard.type("List item 1");
    await page.keyboard.press("Enter");
    await page.keyboard.type("List item 2");
    await page.keyboard.press("Enter");
    await clickToolbarItem(page, "indent");
    await page.keyboard.type("List item 3");
    await clickToolbarItem(page, "outdent");

    await page.evaluate(async () => {
      await window.MTRichTextEditor.save();
    });

    const content = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
    expect(content).toBe(`<ul>
<li>List item 1</li>
<li>List item 2</li>
<li>List item 3</li>
</ul>`);
  });

  test("apply outdent to list item for de-indent", async ({ page }) => {
    await page.goto("/");
    const textarea = await page.locator("#editor");
    await page.locator('[data-mt-rich-text-editor-id="editor"]').click();
    await clickToolbarItem(page, "bulletList");
    await page.keyboard.type("List item 1");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Paragraph");
    await clickToolbarItem(page, "outdent");

    await page.evaluate(async () => {
      await window.MTRichTextEditor.save();
    });

    const content = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
    expect(content).toBe(`<ul>
<li>List item 1</li>
</ul>
<p>Paragraph</p>`);
  });
});
