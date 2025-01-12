import type { Editor } from "./editor";
import type { EditorView } from "@tiptap/pm/view";
import PasteMenuUI from "./ui/PasteMenu.svelte";
import { mount, unmount } from "svelte";

interface PasteMenuOptions {
  target: HTMLDivElement;
  editor: Editor;
  onPaste: (callback: (view: EditorView, event: ClipboardEvent) => boolean) => void;
  pasteMenu: string[];
  options: Record<string, any>;
  inline: boolean;
}

export class PasteMenu {
  private pasteMenu: ReturnType<typeof mount> | undefined;
  #isPasting: boolean = false;

  constructor({ target, editor, onPaste, pasteMenu, options }: PasteMenuOptions) {
    if (pasteMenu.length === 0) {
      return;
    }

    this.pasteMenu = mount(PasteMenuUI, {
      target,
      props: {
        editor,
        onPaste,
        pasteMenu,
        options,
        setIsPasting: (isPasting: boolean) => {
          this.#isPasting = isPasting;
        },
      },
    });
  }

  public isPasting(): boolean {
    return this.#isPasting;
  }

  public destroy(): void {
    if (this.pasteMenu) {
      unmount(this.pasteMenu);
    }
  }
}
