import { expect, test } from "@playwright/test";
import type {} from "../src/mt-rich-text-editor";
import { clickToolbarItem, open, save } from "./util";

test.describe("source and structure editing", () => {
  test("saves edited HTML from the source editor back to the textarea", async ({ page }) => {
    await open(page, { content: "<p>Initial</p>" });

    await clickToolbarItem(page, "source");
    await page.locator(".modal textarea").fill("<h2>Updated from source</h2>");
    await page.locator(".modal button.primary").click();

    await expect(page.locator(".modal")).toHaveCount(0);
    await expect.poll(() => save(page)).toBe("<h2>Updated from source</h2>");
  });

  test("updates structure attributes and serializes them to HTML", async ({ page }) => {
    await open(page, {
      url: "/?structure",
      content: "<div>alpha</div>",
    });

    await page.evaluate(() => {
      const target = document
        .querySelector('[data-mt-rich-text-editor-id="editor"]')
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-content")
        ?.shadowRoot?.querySelector<HTMLElement>('[contenteditable="true"] div');

      if (!target) {
        return;
      }

      const rect = target.getBoundingClientRect();
      target.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          clientX: rect.left + 5,
          clientY: rect.top + 5,
        })
      );
    });

    await page.locator("#structure-id").fill("hero");
    await page.locator("#structure-class-name").fill("lead");
    await page.locator("#structure-style").fill("color:red");
    await page.locator(".modal button.primary").click();

    await expect
      .poll(() => save(page))
      .toBe(`<div id="hero" class="lead" style="color: red;">alpha</div>`);
  });
});
