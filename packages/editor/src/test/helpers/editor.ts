import { Editor } from "../../editor";
import type { EditorOptions } from "../../editor";

export interface EditorHarness {
  editor: Editor;
  textarea: HTMLTextAreaElement;
  cleanup: () => void;
}

export interface MountedEditorElement<
  TElement extends HTMLElement,
  TOptions extends Record<string, unknown> = Record<string, unknown>,
> extends EditorHarness {
  element: TElement;
  initOptions: TOptions;
}

interface MountEditorElementOptions<
  TElement extends HTMLElement,
  TOptions extends Record<string, unknown> = Record<string, unknown>,
> {
  tagName: string;
  elementClass?: CustomElementConstructor;
  editorOptions?: Partial<EditorOptions>;
  getInitOptions?: (editor: Editor, element: TElement) => TOptions;
}

interface EditorInitElement<TOptions extends Record<string, unknown> = Record<string, unknown>> {
  onEditorInit?: (editor: Editor, options: TOptions) => void;
}

export const flushMicrotasks = async () => {
  await Promise.resolve();
};

export const removeOpenModal = () => {
  document.querySelector<HTMLElement>(".modal")?.remove();
};

export const defineCustomElementOnce = (
  tagName: string,
  elementClass: CustomElementConstructor
) => {
  if (!window.customElements.get(tagName)) {
    window.customElements.define(tagName, elementClass);
  }
};

export const createEditorHarness = (options: Partial<EditorOptions> = {}): EditorHarness => {
  const textarea = document.createElement("textarea");
  document.body.appendChild(textarea);

  const editor = new Editor(textarea, {
    toolbar: [],
    inline: false,
    ...options,
  });

  return {
    editor,
    textarea,
    cleanup: () => {
      removeOpenModal();
      editor.destroy();
      textarea.remove();
    },
  };
};

export const mountEditorElement = <
  TElement extends HTMLElement & EditorInitElement<TOptions>,
  TOptions extends Record<string, unknown> = Record<string, unknown>,
>({
  tagName,
  elementClass,
  editorOptions = {},
  getInitOptions,
}: MountEditorElementOptions<TElement, TOptions>): MountedEditorElement<TElement, TOptions> => {
  if (elementClass) {
    defineCustomElementOnce(tagName, elementClass);
  }

  const harness = createEditorHarness(editorOptions);
  const element = document.createElement(tagName) as TElement;
  const initOptions = getInitOptions?.(harness.editor, element) ?? ({} as TOptions);

  element.onEditorInit?.(harness.editor, initOptions);
  document.body.appendChild(element);

  return {
    ...harness,
    element,
    initOptions,
    cleanup: () => {
      element.remove();
      harness.cleanup();
    },
  };
};

export const findTextPosition = (editor: Editor, text: string, offset = 0): number => {
  let position = -1;

  editor.tiptap.state.doc.descendants((node, nodePos) => {
    if (!node.isText || !node.text) {
      return;
    }

    const index = node.text.indexOf(text);
    if (index === -1) {
      return;
    }

    position = nodePos + index + offset;
    return false;
  });

  if (position === -1) {
    throw new Error(`Text not found: ${text}`);
  }

  return position;
};

export const setTextSelection = (editor: Editor, from: number, to: number = from) => {
  editor.tiptap.chain().setTextSelection({ from, to }).run();
};

export const setTextSelectionByText = (editor: Editor, text: string) => {
  const from = findTextPosition(editor, text);
  setTextSelection(editor, from, from + text.length);
};

export const setNodeSelectionByName = (editor: Editor, name: string) => {
  let position = -1;

  editor.tiptap.state.doc.descendants((node, nodePos) => {
    if (node.type.name !== name) {
      return;
    }

    position = nodePos;
    return false;
  });

  if (position === -1) {
    throw new Error(`Node not found: ${name}`);
  }

  editor.tiptap.chain().setNodeSelection(position).run();
};
