import type Quill from "quill";

export class Editor {
  private quill: Quill | null;
  private textarea: HTMLTextAreaElement;

  constructor(opts: { quill: Quill; textarea: HTMLTextAreaElement }) {
    this.quill = opts.quill;
    this.textarea = opts.textarea;
  }

  public save(): void {
    this.textarea.value = this.getContent();
  }

  public getContent(): string {
    return this.quill?.getSemanticHTML() ?? "";
  }

  public setContent(content: string): void {
    this.quill?.setContents(this.quill.clipboard.convert({ html: content }));
  }

  public focus(): void {
    this.quill?.focus();
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
