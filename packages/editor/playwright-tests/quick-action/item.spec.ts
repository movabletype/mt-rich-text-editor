import { test, expect, type Page } from "@playwright/test";
import type {} from "../../src/mt-rich-text-editor";
import { save } from "../util";

// QuickAction's visibility/filtering updates through a debounced effect, so
// the panel content can briefly lag behind what was just typed. Poll for the
// panel's actual state instead of guessing a fixed delay.
const getQuickActionButtonVariants = (page: Page) =>
  page.evaluate(() => {
    const panel = document
      .querySelector('[data-mt-rich-text-editor-id="editor"]')
      ?.shadowRoot?.querySelector(".mt-rich-text-editor-content")
      ?.shadowRoot?.querySelector<HTMLElement>(".mt-rich-text-editor-quick-action");
    if (!panel || panel.style.display !== "block") {
      return [];
    }
    return Array.from(panel.querySelectorAll("[data-mt-rich-text-editor-panel-item-variant]")).map(
      (el) => el.getAttribute("data-mt-rich-text-editor-panel-item-variant")
    );
  });

test.describe("Quick Action", () => {
  test("heading 1", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-mt-rich-text-editor-id="editor"]').click();
    await page.keyboard.type("/h");
    await expect
      .poll(() => getQuickActionButtonVariants(page))
      .toEqual(["1", "2", "3", "4", "5", "6"]);
    await page.keyboard.type("1");
    await expect.poll(() => getQuickActionButtonVariants(page)).toEqual(["1"]);
    await page.keyboard.press("Enter");
    await page.keyboard.type("Heading 1");

    await expect.poll(() => save(page)).toBe("<h1>Heading 1</h1>");
  });
});
