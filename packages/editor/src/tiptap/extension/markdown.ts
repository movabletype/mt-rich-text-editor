import { Extension } from "@tiptap/core";

interface MarkdownData {
  content: string;
}

export interface MarkdownOptions {
  HTMLAttributes: Record<string, any>;
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
      isMarkdownConversionAvailable: () => (() => !!this.options.toHtml) as any,
      markdownToHtml: (data: MarkdownData) => (() => this.options.toHtml(data)) as any,
    };
  },
});
