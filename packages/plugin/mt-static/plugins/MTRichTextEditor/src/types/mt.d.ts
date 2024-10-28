declare global {
  interface Window {
    MT: {
      Editor: {
        new (id: string, manager: unknown): any;
        MTRichTextEditor: any
        apply: (thisArg: any, ...args: any[]) => void;
        prototype: any;
      };
      EditorManager: {
        register: (name: string, editor: any) => void;
        toMode: (format: string) => "wysiwyg" | "source";
      };
    };
  }
  var MT: Window["MT"];
}

export {}
