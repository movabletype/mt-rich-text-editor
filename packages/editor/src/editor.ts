import type Quill from "quill";
import { GenericBlockBlot } from "./blots/generic-block";
const tagNames = GenericBlockBlot.tagName.join("|");
const replaceRe = new RegExp(`^<p>(<(${tagNames}).*<\/\\2>)<\/p>$`);

export class Editor {
  public quill: Quill | null;
  private textarea: HTMLTextAreaElement;

  constructor(opts: { quill: Quill; textarea: HTMLTextAreaElement }) {
    this.quill = opts.quill;
    this.textarea = opts.textarea;
  }

  public save(): void {
    this.textarea.value = this.getContent();
  }

  public getContent(): string {
    return (this.quill?.getSemanticHTML() ?? "").replace(replaceRe, "$1");
  }

  public setContent(content: string): void {
    this.quill?.setContents(this.quill.clipboard.convert({ html: content }));
  }

  public getHeight(): number {
    return this.quill?.root.clientHeight ?? 0;
  }

  public setHeight(height: number): void {
    if (height === 0) {
      return;
    }
    (this.quill as Quill).root.style.height = `${height}px`;
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
    this.quill?.clipboard.dangerouslyPasteHTML(0, content);
  }
}
