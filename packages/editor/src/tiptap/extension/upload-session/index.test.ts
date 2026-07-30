import { Editor } from "../../../editor";
import type { EditorHarness } from "../../../test/helpers/editor";
import { createEditorHarness } from "../../../test/helpers/editor";

describe("UploadSession", () => {
  let editor: Editor;
  let harness: EditorHarness;

  beforeEach(() => {
    harness = createEditorHarness();
    ({ editor } = harness);
  });

  afterEach(() => {
    harness.cleanup();
  });

  it("parses upload session attributes and removes the image from normalized output", () => {
    const input =
      '<p><img src="/a.png" data-mt-rich-text-editor-upload-session="s1" data-mt-rich-text-editor-upload-session-index="0"></p>';
    editor.setContent(input);

    const image = editor.tiptap.getJSON().content?.[0]?.content?.[0];
    expect(image).toMatchObject({
      type: "image",
      attrs: {
        uploadSessionId: "s1",
        uploadSessionIndex: 0,
      },
    });

    const tiptapHTML = editor.tiptap.getHTML();
    expect(tiptapHTML).toContain('data-mt-rich-text-editor-upload-session="s1"');
    expect(tiptapHTML).toContain('data-mt-rich-text-editor-upload-session-index="0"');
    expect(editor.getContent()).toBe("");
  });
});
