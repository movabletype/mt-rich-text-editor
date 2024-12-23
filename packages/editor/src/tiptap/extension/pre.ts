import { Node, mergeAttributes } from '@tiptap/core'

export interface PreOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pre: {
      setPre: () => ReturnType
      unsetPre: () => ReturnType
    }
  }
}

export const Pre = Node.create<PreOptions>({
  name: 'pre',
  priority: 1000,
  group: 'block',
  content: 'text*',
  defining: true,

  parseHTML() {
    return [
      { tag: 'pre' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['pre', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setPre: () => ({ commands }) => {
        return commands.setNode(this.name)
      },
      unsetPre: () => ({ commands }) => {
        return commands.setNode('paragraph')
      },
    }
  },
}) 
