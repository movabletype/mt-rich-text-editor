import { Extension, Mark } from "@tiptap/core";

export interface SpanOptions {
  elements: string[];
}

export const Span = Extension.create<SpanOptions>({
  name: "span-like-element",

  addOptions() {
    return {
      elements: [],
    };
  },

  addExtensions() {
    return this.options.elements.map((element) =>
      Mark.create({
        name: element,
        priority: 1000,
        // MarkConfig has no `content` field in its type, but Tiptap accepts it at runtime
        // to let this mark contain block-level content.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        content: "inline*",

        parseHTML() {
          return [
            {
              tag: element,
            },
          ];
        },
        renderHTML({ HTMLAttributes }) {
          return [element, HTMLAttributes, 0];
        },
      })
    );
  },
});
