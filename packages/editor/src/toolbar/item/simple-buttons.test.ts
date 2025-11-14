import { Editor } from "../../editor";
import type { Events } from "../../editor";

describe("SourceButton", () => {
  let textarea: HTMLTextAreaElement;
  let editor: Editor;
  let sourceButton: HTMLElement;

  beforeEach(() => {
    textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    editor = new Editor(textarea, {
      toolbar: [[[["source"]]]],
      inline: false,
    });

    const editorEl = document.querySelector<HTMLElement>(".mt-rich-text-editor");
    const toolbarEl = editorEl!.shadowRoot?.querySelector<HTMLElement>(
      ".mt-rich-text-editor-toolbar"
    );
    sourceButton = toolbarEl!.shadowRoot!.querySelector<HTMLElement>(
      "mt-rich-text-editor-toolbar-item-source"
    ) as HTMLElement;
  });

  afterEach(() => {
    document.querySelector<HTMLElement>(".modal")?.remove();
    editor.destroy();
    textarea.remove();
  });

  describe("update", () => {
    it("should update the textarea content when the editor content changes", () => {
      let setContentData: Events["setContent"] | undefined;
      const oldContent = "<p>content</p>";
      const newContent = "<p>new content</p>";

      editor.setContent(oldContent);
      editor.on("setContent", (data) => {
        setContentData = data;
      });

      sourceButton?.click();
      const sourceModalTextarea = document.querySelector<HTMLTextAreaElement>(".modal textarea");
      expect(sourceModalTextarea?.value).toBe(oldContent);

      sourceModalTextarea!.value = newContent;
      sourceModalTextarea!.dispatchEvent(new Event("input"));
      const submitButton = document.querySelector<HTMLButtonElement>(".modal button.primary");
      submitButton?.click();

      expect(setContentData?.source).toBe("sourceEditor");
      expect(setContentData?.content).toBe(newContent);
      expect(editor.getContent()).toBe(newContent);
    });
  });
});
