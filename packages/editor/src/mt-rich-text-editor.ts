import EditorManager from ".";

declare global {
  interface Window {
    MTRichTextEditor: typeof EditorManager;
  }
}

window.MTRichTextEditor = EditorManager;
