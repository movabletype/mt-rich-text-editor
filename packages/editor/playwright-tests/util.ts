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
