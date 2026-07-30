import { Extension, Mark } from "@tiptap/core";

export interface SpanOptions {
  elements: string[];
}

const textStyleProperties = new Set(["color", "background-color"]);

const getStylePropertyNames = (style: string): string[] => {
  return style
    .split(";")
    .map((declaration) => {
      const [property] = declaration.split(":", 1);
      return property.trim().toLowerCase();
    })
    .filter(Boolean);
};

const isOnlyTextColorStyleSpan = (element: HTMLElement): boolean => {
  if (element.attributes.length !== 1) {
    return false;
  }

  const style = element.getAttribute("style");
  if (style === null) {
    return false;
  }

  const properties = getStylePropertyNames(style);
  return properties.length > 0 && properties.every((property) => textStyleProperties.has(property));
};

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
              getAttrs:
                element === "span"
                  ? (node) => {
                      if (node instanceof HTMLElement && isOnlyTextColorStyleSpan(node)) {
                        return false;
                      }

                      return {};
                    }
                  : undefined,
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
