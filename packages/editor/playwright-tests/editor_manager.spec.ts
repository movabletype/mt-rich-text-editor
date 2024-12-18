import { test, expect } from '@playwright/test';

test.describe('EditorManager', () => {
  test('initialize', async ({ page }) => {
    await page.goto('/');
    const editorExists = await page.locator('[data-id="editor"] .ql-editor').isVisible();
    expect(editorExists).toBeTruthy();
  });

  test('edit', async ({ page }) => {
    await page.goto('/');
    const textarea = await page.locator('#editor');
    await page.locator('[data-id="editor"] .ql-editor').fill('Test text');
    await page.evaluate(async () => {
      await window.MTRichTextEditor.save();
    });

    const content = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
    expect(content).toBe('<p>Test&nbsp;text</p>');
  });

  // test('get and manipulate editor', async ({ page }) => {
  //   await page.setContent(`<div id="editor1"></div>`);

  //   await page.evaluate(() => {
  //     const manager = new EditorManager();
  //     manager.initializeEditor('#editor1');
  //   });

  //   // Input text to editor
  //   await page.locator('#editor1 .ql-editor').fill('Test text');

  //   // Verify the text was correctly input
  //   const content = await page.locator('#editor1 .ql-editor').textContent();
  //   expect(content).toBe('Test text');
  // });
}); 
