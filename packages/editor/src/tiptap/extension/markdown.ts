import { Extension } from "@tiptap/core";

interface MarkdownData {
  content: string;
}

export interface MarkdownOptions {
  HTMLAttributes: Record<string, unknown>;
  toHtml: (data: MarkdownData) => Promise<{ content: string }>;
}

declare module "@tiptap/core" {
  interface Commands {
    markdown: {
      isMarkdownConversionAvailable: () => boolean;
      markdownToHtml: (data: MarkdownData) => Promise<{ content: string }>;
    };
  }
}

export const Markdown = Extension.create<MarkdownOptions>({
  name: "markdown",
  addCommands() {
    return {
      // FIXME: fix type error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      isMarkdownConversionAvailable: () => (() => !!this.options.toHtml) as any,
      // FIXME: fix type error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      markdownToHtml: (data: MarkdownData) => (() => this.options.toHtml(data)) as any,
    };
  },
});
