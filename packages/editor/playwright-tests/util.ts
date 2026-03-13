import type { Page } from "@playwright/test";

declare global {
  interface Window {
    embedObjectResolver?: (args: {
      url: string;
      maxwidth?: number;
      maxheight?: number;
    }) => Promise<{ html: string } | null>;
  }
}

export const open = async (page: Page, {
  content = "",
  url = "/",
}) => {
  await page.goto(url);
  await page.evaluate(
    ({ content }) => {
      sessionStorage.setItem("MTRichTextEditorInitialContent", content);
    },
    { content }
  );
  await page.goto(url); // reload to apply initial content
};

export const save = async (page: Page): Promise<string> => {
  await page.evaluate(async () => {
    await window.MTRichTextEditor.save();
  });
  const textarea = await page.locator("#editor");
  const content = await textarea.evaluate((el: HTMLTextAreaElement) => el.value);
  return content;
}

export const mockEmbedObjectResolver = (
  page: Page,
  resolver: (args: { url: string; maxwidth?: number; maxheight?: number }) => Promise<object>
) => {
  return page.evaluate(
    ({ resolverStr }) => {
      window.embedObjectResolver = eval(resolverStr);
    },
    { resolverStr: resolver.toString() }
  );
};

export const clickToolbarItem = async (page: Page, itemName: string) => {
  return await page.evaluate(
    ({ itemName }) => {
      document
        .querySelector('[data-mt-rich-text-editor-id="editor"]')
        ?.shadowRoot?.querySelector(".mt-rich-text-editor-toolbar")
        ?.shadowRoot?.querySelector<HTMLElement>(`mt-rich-text-editor-toolbar-item-${itemName}`)
        ?.click();
    },
    {
      itemName,
    }
  );
};

export const selectToolbarBlock = async (page: Page, value: string) => {
  return await page.evaluate(
    async ({ value }) => {
      const block = document
        .querySelector('[data-mt-rich-text-editor-id="editor"]')
        ?.shadowRoot?.querySelector("mt-rich-text-editor-toolbar-item-block");
      const shadow = block?.shadowRoot;

      shadow?.querySelector<HTMLElement>(".selected")?.click();
      await Promise.resolve();
      shadow
        ?.querySelectorAll<HTMLButtonElement>(".option")
        .forEach((option) => {
          if (option.querySelector(`.${value}`)) {
            option.click();
          }
        });
    },
    { value }
  );
};
