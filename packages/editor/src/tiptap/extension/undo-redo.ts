import {
  UndoRedo as TiptapUndoRedo,
  UndoRedoOptions as TiptapUndoRedoOptions,
} from "@tiptap/extensions";

export interface UndoRedoOptions extends TiptapUndoRedoOptions {
  registerShortcuts?: boolean;
}

export const UndoRedo = TiptapUndoRedo.extend<UndoRedoOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      registerShortcuts: true,
    } as UndoRedoOptions;
  },

  addKeyboardShortcuts() {
    if (this.options.registerShortcuts) {
      return this.parent?.() ?? {};
    } else {
      return {};
    }
  },
});
