import { Link } from "@tiptap/extension-link";

interface InlineLinkOptions {
  shortcutHandler?: () => void;
}

declare module "@tiptap/core" {
  interface Commands {
    inlineLink: {
      setInlineLinkShortcutHandler: (handler: () => void) => boolean;
    };
  }
}

export const InlineLink = Link.extend<InlineLinkOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      shortcutHandler: undefined,
    };
  },

  addAttributes() {
    return {
      href: {
        default: null,
        parseHTML(element) {
          return element.getAttribute("href");
        },
      },
      target: {
        default: null,
      },
      title: {
        default: null,
      },
      rel: {
        default: null,
      },
      class: {
        default: null,
      },
      HTMLAttributes: {
        default: {},
        parseHTML: (element) => {
          const attrs: Record<string, string> = {};
          Array.from(element.attributes).forEach((attr) => {
            attrs[attr.name] = attr.value;
          });
          return attrs;
        },
        renderHTML: (attributes) => attributes.HTMLAttributes,
      },
      "data-inline": {
        default: "true",
        renderHTML: () => null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "a:not([data-mt-rich-text-editor-block])",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) {
            return false;
          }

          const attrs: Record<string, string> = {};
          Array.from(element.attributes).forEach((attr) => {
            attrs[attr.name] = attr.value;
          });

          return {
            HTMLAttributes: attrs,
            "data-inline": element.getAttribute("data-inline"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { HTMLAttributes: attrs = {}, ...rest } = HTMLAttributes;
    return ["a", { ...attrs, ...rest, "data-inline": undefined }, 0];
  },

  addKeyboardShortcuts() {
    return {
      "Mod-k": () => {
        this.options.shortcutHandler?.();
        return true;
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setInlineLinkShortcutHandler: (handler: () => void) => (() => {
        this.options.shortcutHandler = handler;
      }) as any,
    };
  },
});
