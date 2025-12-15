import { test, expect, Page } from "@playwright/test";
import type {} from "../src/mt-rich-text-editor";
import { mockEmbedObjectResolver, open, save } from "./util";

const insertEmbedObject = async (page: Page) => {
  await mockEmbedObjectResolver(page, async () => ({
    title: "MTDDC Meetup TOKYO 2021 \u57fa\u8abf\u8b1b\u6f14",
    author_name: "\u30b7\u30c3\u30af\u30b9\u30fb\u30a2\u30d1\u30fc\u30c8\u682a\u5f0f\u4f1a\u793e",
    author_url: "https://www.youtube.com/@SixApart_Ltd",
    type: "video",
    height: 281,
    width: 500,
    version: "1.0",
    provider_name: "YouTube",
    provider_url: "https://www.youtube.com/",
    thumbnail_height: 360,
    thumbnail_width: 480,
    thumbnail_url: "https://i.ytimg.com/vi/y1doGV8WZzM/hqdefault.jpg",
    html: "\u003ciframe width=\u0022500\u0022 height=\u0022281\u0022 src=\u0022https://www.youtube.com/embed/y1doGV8WZzM?feature=oembed\u0022 frameborder=\u00220\u0022 allow=\u0022accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\u0022 referrerpolicy=\u0022strict-origin-when-cross-origin\u0022 allowfullscreen title=\u0022MTDDC Meetup TOKYO 2021 \u57fa\u8abf\u8b1b\u6f14\u0022\u003e\u003c/iframe\u003e",
  }));
  const textarea = await page.locator("#editor");
  await page.locator('[data-mt-rich-text-editor-id="editor"]').click();
  await page.evaluate(() => {
    const clipboardData = new DataTransfer();
    clipboardData.setData("text/plain", "https://www.youtube.com/watch?v=y1doGV8WZzM");
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
  const content = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
  expect(content).toBe(
    `<div data-mt-rich-text-editor-embed-object=""><iframe width="500" height="281" src="https://www.youtube.com/embed/y1doGV8WZzM?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen="" title="MTDDC Meetup TOKYO 2021 基調講演"></iframe></div>`
  );
};

test.describe("embedObject", () => {
  test("select embedObject", async ({ page }) => {
    await page.goto("/");
    await insertEmbedObject(page);

    await page.keyboard.type("Some text after embed!");

    await page.evaluate(() => {
      return document
        .querySelector('[data-mt-rich-text-editor-id="editor"]')
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-content")
        ?.shadowRoot?.querySelector<HTMLElement>("iframe[data-mt-rich-text-editor-iframe]")
        ?.click();
    });

    await page.keyboard.press("Backspace");

    await page.evaluate(async () => {
      await window.MTRichTextEditor.save();
    });
    const textarea = await page.locator("#editor");
    const content = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
    expect(content).toBe(`<p>Some text after embed!</p>`);
  });

  test("delete embedObject", async ({ page }) => {
    await page.goto("/");
    await insertEmbedObject(page);

    await page.keyboard.type("x");
    await new Promise((r) => setTimeout(r, 50)); // wait for paste menu show
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("Backspace"); // press backspace with a paragraph having some

    await page.evaluate(async () => {
      await window.MTRichTextEditor.save();
    });
    const textarea = await page.locator("#editor");
    const content = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
    expect(content).toBe(`<p>x</p>`);
  });

  test("delete blank paragraph", async ({ page }) => {
    await page.goto("/");
    await insertEmbedObject(page);

    await page.keyboard.type("x");
    await page.keyboard.press("Backspace"); // make blank paragraph
    await page.keyboard.press("Backspace"); // press backspace with a blank paragraph

    await page.evaluate(async () => {
      await window.MTRichTextEditor.save();
    });
    const textarea = await page.locator("#editor");
    const content = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
    expect(content).toBe(
      `<div data-mt-rich-text-editor-embed-object=""><iframe width="500" height="281" src="https://www.youtube.com/embed/y1doGV8WZzM?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen="" title="MTDDC Meetup TOKYO 2021 基調講演"></iframe></div>`
    );
  });

  test("open editor with embedObject content", async ({ page }) => {
    await open(page, {
      content: `<div data-mt-rich-text-editor-embed-object=""><iframe width="500" height="281" src="https://www.youtube.com/embed/y1doGV8WZzM?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen="" title="MTDDC Meetup TOKYO 2021 基調講演"></iframe></div>`,
    });

    await page.evaluate(() => {
      return document
        .querySelector('[data-mt-rich-text-editor-id="editor"]')
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-content")
        ?.shadowRoot?.querySelector<HTMLElement>("iframe[data-mt-rich-text-editor-iframe]")
        ?.click();
    });
    await new Promise((r) => setTimeout(r, 100));
    await page.keyboard.press("ArrowRight");
    await new Promise((r) => setTimeout(r, 100));
    await page.keyboard.type("Some text after embed!");

    const content = await save(page);
    expect(content).toBe(
      `<div data-mt-rich-text-editor-embed-object=""><iframe width="500" height="281" src="https://www.youtube.com/embed/y1doGV8WZzM?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen="" title="MTDDC Meetup TOKYO 2021 基調講演"></iframe></div>
<p>Some text after embed!</p>`
    );
  });

  test("press left arrow at embedObject content", async ({ page }) => {
    await open(page, {
      content: `<div data-mt-rich-text-editor-embed-object=""><iframe width="500" height="281" src="https://www.youtube.com/embed/y1doGV8WZzM?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen="" title="MTDDC Meetup TOKYO 2021 基調講演"></iframe></div>`,
    });

    await page.evaluate(() => {
      return document
        .querySelector('[data-mt-rich-text-editor-id="editor"]')
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-content")
        ?.shadowRoot?.querySelector<HTMLElement>("iframe[data-mt-rich-text-editor-iframe]")
        ?.click();
    });
    await new Promise((r) => setTimeout(r, 100));
    await page.keyboard.press("ArrowLeft");
    await new Promise((r) => setTimeout(r, 100));
    await page.keyboard.type("Some text before embed!");
    await page.keyboard.press("ArrowRight");
    await new Promise((r) => setTimeout(r, 100));
    await page.keyboard.press("ArrowLeft");
    await new Promise((r) => setTimeout(r, 100));
    await page.keyboard.type("And more text!");

    const content = await save(page);
    expect(content).toBe(
      `<p>Some text before embed!And more text!</p>
<div data-mt-rich-text-editor-embed-object=""><iframe width="500" height="281" src="https://www.youtube.com/embed/y1doGV8WZzM?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen="" title="MTDDC Meetup TOKYO 2021 基調講演"></iframe></div>`
    );
  });

  test("press right arrow at embedObject content", async ({ page }) => {
    await open(page, {
      content: `<div data-mt-rich-text-editor-embed-object=""><iframe width="500" height="281" src="https://www.youtube.com/embed/y1doGV8WZzM?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen="" title="MTDDC Meetup TOKYO 2021 基調講演"></iframe></div>`,
    });

    await page.evaluate(() => {
      return document
        .querySelector('[data-mt-rich-text-editor-id="editor"]')
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-content")
        ?.shadowRoot?.querySelector<HTMLElement>("iframe[data-mt-rich-text-editor-iframe]")
        ?.click();
    });
    await new Promise((r) => setTimeout(r, 100));
    await page.keyboard.press("ArrowRight");
    await new Promise((r) => setTimeout(r, 100));
    await page.keyboard.type("!");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await new Promise((r) => setTimeout(r, 100)); // now select embed object
    await page.keyboard.press("ArrowRight");
    await new Promise((r) => setTimeout(r, 100));
    await page.keyboard.type("Some text after embed"); // insert before "!"

    const content = await save(page);
    expect(content).toBe(
      `<div data-mt-rich-text-editor-embed-object=""><iframe width="500" height="281" src="https://www.youtube.com/embed/y1doGV8WZzM?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen="" title="MTDDC Meetup TOKYO 2021 基調講演"></iframe></div>
<p>Some text after embed!</p>`
    );
  });
});
