import { expect, test } from "@playwright/test";
import type {} from "../src/mt-rich-text-editor";
import { open } from "./util";

test.describe("boilerplate modal", () => {
  test("applies content stylesheets to the preview", async ({ page }) => {
    await open(page, { content: "" });

    await page.evaluate(async () => {
      const textarea = document.createElement("textarea");
      textarea.id = "boilerplate-editor";
      document.body.appendChild(textarea);
      await window.MTRichTextEditor.create({
        id: "boilerplate-editor",
        toolbar: [[[["boilerplate"]]]],
        toolbarOptions: {
          boilerplate: {
            boilerplates: [
              {
                title: "Example",
                url: `data:text/plain,${encodeURIComponent('<p class="highlight">Hello</p>')}`,
                description: "",
              },
            ],
          },
        },
        stylesheets: [".highlight { color: rgb(255, 0, 0) }"],
        classNames: ["entry-body"],
      });
    });

    await page.evaluate(() => {
      document
        .querySelector('[data-mt-rich-text-editor-id="boilerplate-editor"]')
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-toolbar")
        ?.shadowRoot?.querySelector<HTMLElement>("mt-rich-text-editor-toolbar-item-boilerplate")
        ?.click();
    });

    await expect
      .poll(() =>
        page.evaluate(() => {
          const preview = document.querySelector("#boilerplate_text");
          const p = preview?.shadowRoot?.querySelector("p.highlight");
          return p ? getComputedStyle(p).color : null;
        })
      )
      .toBe("rgb(255, 0, 0)");

    const previewClassName = await page.evaluate(() => {
      const preview = document.querySelector("#boilerplate_text");
      return preview?.shadowRoot?.querySelector("p.highlight")?.parentElement?.className;
    });
    expect(previewClassName).toBe("entry-body");
  });
});
