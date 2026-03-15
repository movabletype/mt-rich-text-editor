import { test, expect, type Page } from "@playwright/test";
import type {} from "../src/mt-rich-text-editor";
import { open, save } from "./util";

const setSelectionByText = async (page: Page, text: string, offset = 0) => {
  const selectionPos = await page.evaluate(
    ({ text, offset }) => {
      const editor = window.MTRichTextEditor.get({ id: "editor" });
      if (!editor) {
        throw new Error("Editor not found");
      }

      let selectionPos = -1;
      editor.tiptap.state.doc.descendants((node, pos) => {
        if (!node.isText || !node.text) {
          return;
        }

        const index = node.text.indexOf(text);
        if (index === -1) {
          return;
        }

        selectionPos = pos + index + offset;
        return false;
      });

      if (selectionPos === -1) {
        throw new Error(`Text not found: ${text}`);
      }

      editor.tiptap.chain().setTextSelection(selectionPos).focus().run();
      return selectionPos;
    },
    { text, offset }
  );

  await expect.poll(async () => {
    return page.evaluate(() => window.MTRichTextEditor.get({ id: "editor" })!.tiptap.state.selection.from);
  }).toBe(selectionPos);
};

const setSelectionToFirstEmptyTextBlock = async (page: Page) => {
  const selectionPos = await page.evaluate(() => {
    const editor = window.MTRichTextEditor.get({ id: "editor" });
    if (!editor) {
      throw new Error("Editor not found");
    }

    let selectionPos = -1;
    editor.tiptap.state.doc.descendants((node, pos) => {
      if (node.type.name === "textBlock" && node.content.size === 0) {
        selectionPos = pos + 1;
        return false;
      }
    });

    if (selectionPos === -1) {
      throw new Error("Empty textBlock not found");
    }

    editor.tiptap.chain().setTextSelection(selectionPos).focus().run();
    return selectionPos;
  });

  await expect.poll(async () => {
    return page.evaluate(() => window.MTRichTextEditor.get({ id: "editor" })!.tiptap.state.selection.from);
  }).toBe(selectionPos);
};

const getInternalHTML = async (page: Page) => {
  return page.evaluate(() => window.MTRichTextEditor.get({ id: "editor" })!.tiptap.getHTML());
};

const normalizeHTML = (html: string) => html.replace(/>\s+</g, "><").trim();

test.describe("textBlock", () => {
  test("collapses an empty sibling wrapper on Backspace and keeps editing", async ({ page }) => {
    await open(page, {
      content: "<div>a</div><div></div>",
    });
    await setSelectionToFirstEmptyTextBlock(page);

    await page.keyboard.press("Backspace");

    await expect.poll(() => getInternalHTML(page)).toBe("<div><mt-text-block>a</mt-text-block></div>");
    await expect.poll(() => save(page)).toBe("<div>a</div>");

    await page.keyboard.type("x");

    await expect.poll(() => save(page)).toBe("<div>ax</div>");
  });

  test("deletes the last character without creating a sibling wrapper", async ({ page }) => {
    await open(page, {
      content: "<div>a</div>",
    });
    await setSelectionByText(page, "a", 1);

    await page.keyboard.press("Backspace");

    await expect.poll(() => getInternalHTML(page)).toBe("<div><mt-text-block></mt-text-block></div>");
    await expect.poll(() => save(page)).toBe("<div></div>");

    await page.keyboard.type("x");

    await expect.poll(() => save(page)).toBe("<div>x</div>");
  });

  test("deletes an emoji as a single character on Backspace", async ({ page }) => {
    await open(page, {
      content: "<div>😀</div>",
    });
    await setSelectionByText(page, "😀", "😀".length);

    await page.keyboard.press("Backspace");

    await expect.poll(() => getInternalHTML(page)).toBe("<div><mt-text-block></mt-text-block></div>");
    await expect.poll(() => save(page)).toBe("<div></div>");
  });

  test("deletes a combining-character grapheme on Backspace", async ({ page }) => {
    const grapheme = "e\u0301";
    await open(page, {
      content: `<div>${grapheme}</div>`,
    });
    await setSelectionByText(page, grapheme, grapheme.length);

    await page.keyboard.press("Backspace");

    await expect.poll(() => getInternalHTML(page)).toBe("<div><mt-text-block></mt-text-block></div>");
    await expect.poll(() => save(page)).toBe("<div></div>");
  });

  test("does not unwrap the first top-level wrapper on Backspace at the start", async ({ page }) => {
    await open(page, {
      content: "<div>a</div>",
    });
    await setSelectionByText(page, "a");

    await page.keyboard.press("Backspace");

    await expect.poll(() => getInternalHTML(page)).toBe("<div><mt-text-block>a</mt-text-block></div>");
    await expect.poll(() => save(page)).toBe("<div>a</div>");

    await page.keyboard.type("x");

    await expect.poll(() => save(page)).toBe("<div>xa</div>");
  });

  test("deletes an empty first top-level wrapper on Backspace at the start", async ({ page }) => {
    await open(page, {
      content: "<div></div>",
    });
    await setSelectionToFirstEmptyTextBlock(page);

    await page.keyboard.press("Backspace");

    await expect.poll(() => getInternalHTML(page)).toBe("<p></p>");
    await expect.poll(() => save(page)).toBe("");

    await page.keyboard.type("x");

    await expect.poll(() => save(page)).toBe("<p>x</p>");
  });

  test("keeps an empty first table cell textBlock on Backspace at the start", async ({ page }) => {
    await open(page, {
      content: "<table><tbody><tr><td></td></tr></tbody></table>",
    });
    await setSelectionToFirstEmptyTextBlock(page);

    await page.keyboard.press("Backspace");

    await expect.poll(() => getInternalHTML(page)).toBe(
      "<table><tr><td><mt-text-block></mt-text-block></td></tr></table>"
    );
    await expect.poll(async () => normalizeHTML(await save(page))).toBe(
      "<table><tbody><tr><td></td></tr></tbody></table>"
    );
  });
});
