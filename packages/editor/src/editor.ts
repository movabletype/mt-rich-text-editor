import type Quill from "quill";

export class Editor {
  private quill: Quill;
  private textarea: HTMLTextAreaElement;

  constructor(opts: { quill: Quill; textarea: HTMLTextAreaElement }) {
    this.quill = opts.quill;
    this.textarea = opts.textarea;
  }

  public async save() {
    const contents = this.quill.root.cloneNode(true) as HTMLElement;
    this.textarea.value = contents.innerHTML;
  }
}
