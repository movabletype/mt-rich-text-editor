import { Paragraph as TiptapParagraph } from "@tiptap/extension-paragraph";
import { mergeAttributes } from "@tiptap/core";

export interface ParagraphOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    paragraph: {
      setParagraph: () => ReturnType;
    };
  }
}

// export const Paragraph = TiptapParagraph;
export const Paragraph = TiptapParagraph.extend<ParagraphOptions>({
  name: "paragraph",
  priority: 1000,
  group: "block",
  content: "inline*",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [{ tag: "p" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { MTRichTextEditorHTMLAttributes, textAlign, ...rest } = node.attrs;
    return ["p", mergeAttributes(this.options.HTMLAttributes, rest, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setParagraph:
        () =>
        ({ commands }) => {
          return commands.setNode(this.name);
        },
    };
  },
});
