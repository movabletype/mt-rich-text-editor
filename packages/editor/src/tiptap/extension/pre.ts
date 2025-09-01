import { Node } from "@tiptap/core";

export interface PreOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pre: {
      setPre: () => ReturnType;
      unsetPre: () => ReturnType;
    };
  }
}

export const Pre = Node.create<PreOptions>({
  name: "pre",
  priority: 1000,
  group: "block",
  content: "inline*|text*",
  defining: true,

  parseHTML() {
    return [
      {
        tag: "pre",
        preserveWhitespace: "full",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["pre", HTMLAttributes, 0];
  },

  addCommands() {
    return {
      setPre:
        () =>
        ({ commands }) => {
          return commands.setNode(this.name);
        },
      unsetPre:
        () =>
        ({ commands }) => {
          return commands.setNode("paragraph");
        },
    };
  },
});
