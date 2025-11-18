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
