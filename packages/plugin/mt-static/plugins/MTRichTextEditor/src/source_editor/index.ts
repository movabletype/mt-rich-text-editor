export default class SourceEditor {
  private textarea: HTMLTextAreaElement;

  constructor({ id }: { id: string }) {
    const textarea = document.querySelector<HTMLTextAreaElement>(`#${id}`);
    if (!textarea) {
      throw new Error(`textarea not found: ${id}`);
    }
    this.textarea = textarea;
    textarea.style.display = "";
  }

  public async save(): Promise<void> {
    console.log("save");
    const contents = this.textarea.value;
    this.textarea.value = contents;
  }

  public getHeight(): number {
    console.log("getHeight");
    return this.textarea.scrollHeight;
  }
}
