import { Editor } from "../../editor";
import { NodeSelection, TextSelection } from "@tiptap/pm/state";

vi.mock("../../util/preview", () => ({
  createPreviewIframe: () => {
    const div = document.createElement("div");
    div.setAttribute("data-preview-mock", "");
    return div;
  },
  destroyPreviewIframe: () => {},
}));

describe("EmbedObject Backspace handler", () => {
  let textarea: HTMLTextAreaElement;
  let editor: Editor;

  beforeEach(() => {
    textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    editor = new Editor(textarea, {
      toolbar: [],
      inline: false,
    });
  });

  afterEach(() => {
    editor.destroy();
    textarea.remove();
  });

  const embedHTML = (content = "<div>embed</div>") =>
    `<div data-mt-rich-text-editor-embed-object="">${content}</div>`;

  const setSelectionInsideEmbed = () => {
    // Find the embedObject node and set a text selection inside it
    const { state } = editor.tiptap;
    let embedPos: number | null = null;
    state.doc.descendants((node, pos) => {
      if (node.type.name === "embedObject" && embedPos === null) {
        // Set cursor inside the embed's first child
        embedPos = pos + 1;
      }
    });
    if (embedPos !== null) {
      // Set a text selection inside the embed node
      editor.tiptap.commands.setTextSelection(embedPos + 1);
    }
  };

  const pressBackspace = () => {
    const { view } = editor.tiptap;
    const event = new KeyboardEvent("keydown", {
      key: "Backspace",
      code: "Backspace",
      bubbles: true,
    });
    view.dom.dispatchEvent(event);
  };

  describe("from inside embed", () => {
    it("should delete empty paragraph before embed and select embed with NodeSelection", () => {
      editor.setContent(`<p></p>${embedHTML()}`);
      setSelectionInsideEmbed();
      pressBackspace();

      const { selection } = editor.tiptap.state;
      expect(selection).toBeInstanceOf(NodeSelection);
      if (selection instanceof NodeSelection) {
        expect(selection.node.type.name).toBe("embedObject");
      }
      // The empty paragraph should be removed
      const doc = editor.tiptap.state.doc;
      expect(doc.childCount).toBe(1);
      expect(doc.firstChild!.type.name).toBe("embedObject");
    });

    it("should move cursor to end of text paragraph before embed", () => {
      editor.setContent(`<p>hello</p>${embedHTML()}`);
      setSelectionInsideEmbed();
      pressBackspace();

      const { selection } = editor.tiptap.state;
      expect(selection).toBeInstanceOf(TextSelection);
      // Cursor should be at end of "hello" paragraph
      // Paragraph: pos 0, "hello" ends at pos 6 (0 + 1(open) + 5(text) = 6), before close = 6
      const $pos = selection.$from;
      expect($pos.parent.type.name).toBe("paragraph");
      expect($pos.parentOffset).toBe(5); // end of "hello"
    });

    it("should select embed with NodeSelection when no node before (document start)", () => {
      editor.setContent(embedHTML());
      setSelectionInsideEmbed();
      pressBackspace();

      const { selection } = editor.tiptap.state;
      expect(selection).toBeInstanceOf(NodeSelection);
      if (selection instanceof NodeSelection) {
        expect(selection.node.type.name).toBe("embedObject");
      }
    });
  });

  describe("from paragraph after embed", () => {
    it("should delete empty paragraph and select embed with NodeSelection", () => {
      editor.setContent(`${embedHTML()}<p></p>`);

      // Set cursor at the start of the empty paragraph after embed
      const { state } = editor.tiptap;
      let paragraphPos: number | null = null;
      state.doc.descendants((node, pos) => {
        if (node.type.name === "paragraph" && paragraphPos === null) {
          // Check this is the paragraph after embed
          const resolved = state.doc.resolve(pos);
          const nodeBefore = resolved.nodeBefore;
          if (nodeBefore?.type.name === "embedObject") {
            paragraphPos = pos + 1; // inside the paragraph
          }
        }
      });
      if (paragraphPos !== null) {
        editor.tiptap.commands.setTextSelection(paragraphPos);
      }
      pressBackspace();

      const { selection } = editor.tiptap.state;
      expect(selection).toBeInstanceOf(NodeSelection);
      if (selection instanceof NodeSelection) {
        expect(selection.node.type.name).toBe("embedObject");
      }
      // Empty paragraph should be removed
      expect(editor.tiptap.state.doc.childCount).toBe(1);
    });

    it("should delete embed when backspacing from start of text paragraph", () => {
      editor.setContent(`${embedHTML()}<p>text</p>`);

      // Set cursor at start of "text" paragraph
      const { state } = editor.tiptap;
      let paragraphPos: number | null = null;
      state.doc.descendants((node, pos) => {
        if (node.type.name === "paragraph" && paragraphPos === null) {
          const resolved = state.doc.resolve(pos);
          const nodeBefore = resolved.nodeBefore;
          if (nodeBefore?.type.name === "embedObject") {
            paragraphPos = pos + 1;
          }
        }
      });
      if (paragraphPos !== null) {
        editor.tiptap.commands.setTextSelection(paragraphPos);
      }
      pressBackspace();

      // Embed should be deleted, text paragraph remains
      const doc = editor.tiptap.state.doc;
      let hasEmbed = false;
      doc.descendants((node) => {
        if (node.type.name === "embedObject") hasEmbed = true;
      });
      expect(hasEmbed).toBe(false);
      expect(doc.textContent).toContain("text");
    });
  });
});
