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
