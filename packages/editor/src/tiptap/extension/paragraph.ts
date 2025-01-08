import { Paragraph as TiptapParagraph } from "@tiptap/extension-paragraph";
import { mergeAttributes } from '@tiptap/core'

export interface ParagraphOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    paragraph: {
      setParagraph: () => ReturnType
    }
  }
}

// export const Paragraph = TiptapParagraph;
export const Paragraph = TiptapParagraph.extend<ParagraphOptions>({
  name: 'paragraph',
  priority: 1000,
  group: 'block',
  content: 'inline*',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
      },
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'p' },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['p', mergeAttributes(this.options.HTMLAttributes, node.attrs, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setParagraph: () => ({ commands }) => {
        return commands.setNode(this.name)
      },
    }
  },
}) 
