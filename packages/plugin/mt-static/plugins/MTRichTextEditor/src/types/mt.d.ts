declare global {
  interface Window {
    MT: {
      Editor: {
        MTRichTextEditor: any;
        apply: (thisArg: any, ...args: any[]) => void;
        prototype: any;
      };
      EditorManager: {
        register: (name: string, editor: any) => void;
      };
    };
  }
  var MT: Window["MT"];
}

export {}
