import {
  History as TiptapHistory,
  HistoryOptions as TiptapHistoryOptions,
} from "@tiptap/extension-history";

export interface HistoryOptions extends TiptapHistoryOptions {
  registerShortcuts?: boolean;
}

export const History = TiptapHistory.extend<HistoryOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      registerShortcuts: true,
    };
  },

  addKeyboardShortcuts() {
    if (this.options.registerShortcuts) {
      return this.parent?.() ?? {};
    } else {
      return {};
    }
  },
});
