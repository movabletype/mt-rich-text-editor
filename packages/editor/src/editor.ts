import type Quill from "quill";

export class Editor {
  private quill: Quill | null;
  private textarea: HTMLTextAreaElement;

  constructor(opts: { quill: Quill; textarea: HTMLTextAreaElement }) {
    this.quill = opts.quill;
    this.textarea = opts.textarea;
  }

  public async save(): Promise<void> {
    const contents = this.quill?.root.cloneNode(true) as HTMLElement;
    this.textarea.value = contents.innerHTML;
  }

  public focus(): void {
    console.log("focus");
  }

  public destroy(): void {
    (this.quill?.getModule("toolbar") as { container: HTMLElement }).container.remove();
    this.quill?.root.parentElement?.remove();
    this.quill = null;
  }

  public insertContent(content: string): void {
    this.quill?.insertText(0, content);
  }
}
