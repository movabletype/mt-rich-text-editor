import { Node } from "@tiptap/core";

export const TextBlock = Node.create({
  name: "textBlock",
  group: "block",
  content: "inline*",

  parseHTML() {
    return [
      {
        tag: "mt-text-block",
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) {
            return false;
          }
          return {};
        },
      },
    ];
  },

  renderHTML({ node }) {
    return ["mt-text-block", 0];
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        if (!editor.isActive(this.name)) {
          return false;
        }

        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        const parentNode = $from.node(-1);
        if (!parentNode) return false;

        const pos = $from.after(-1);
        const currentNodeContent = $from.parent.content.cut($from.parentOffset).toJSON();

        // FIXME: splitListItem('listItem') ?
        const tr = editor
          .chain()
          .insertContentAt(pos, {
            type: parentNode.type.name,
            content: [
              {
                type: this.name,
                content: currentNodeContent,
              },
            ],
          })
          .deleteRange({ from: $from.pos, to: $from.after() });

        const result = tr.run();
        if (!result) return false;

        const resolvedPos = editor.state.doc.resolve(pos + 1);
        const textBlockPos = resolvedPos.start();

        editor.chain().setTextSelection(textBlockPos).focus().run();

        return true;
      },
    };
  },

  addStorage() {
    return {
      originalText: "",
    };
  },
});
