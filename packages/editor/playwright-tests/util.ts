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
}) => {
  await page.goto("/");
  await page.evaluate(
    ({ content }) => {
      sessionStorage.setItem("MTRichTextEditorInitialContent", content);
    },
    { content }
  );
  await page.goto("/"); // reload to apply initial content
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
