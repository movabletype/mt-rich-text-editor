import { Editor } from "../../../editor";
import type { EditorOptions } from "../../../editor";
import { normalizeHTML } from "../../../util/html";
import type { ToolbarItemElement } from "../element";
import Button from "./Button.svelte";

window.customElements.define("mt-toolbar-item-link", Button.element!);

describe("Button", () => {
  let element: HTMLElement & ToolbarItemElement;
  let textarea: HTMLTextAreaElement;
  let editor: Editor;

  const initElement = (options: Partial<EditorOptions> = {}) => {
    if (element && element.parentNode) {
      element.remove();
    }
    element = document.createElement("mt-toolbar-item-link") as HTMLElement & ToolbarItemElement;

    if (textarea && textarea.parentNode) {
      editor.destroy();
      textarea.remove();
    }
    textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    editor = new Editor(textarea, {
      toolbar: [],
      inline: false,
      ...options,
    });

    if ("onEditorInit" in element) {
      element.onEditorInit(
        editor,
        (editor.options.toolbarOptions?.link || {}) as Record<string, unknown>
      );
    }

    document.body.appendChild(element);
  };

  const flush = async () => {
    await Promise.resolve();
  };

  const clickButton = async () => {
    element.dispatchEvent(new MouseEvent("click"));
    await flush();
  };

  const setModalValue = (id: string, value: string) => {
    const input = document.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`);
    expect(input).not.toBeNull();
    input!.value = value;
    input!.dispatchEvent(new Event("input"));
    input!.dispatchEvent(new Event("change"));
  };

  const submitModal = async () => {
    document.querySelector<HTMLButtonElement>(".modal button.primary")?.click();
    await flush();
  };

  const findTextPosition = (text: string, offset = 0) => {
    let pos = -1;

    editor.tiptap.state.doc.descendants((node, nodePos) => {
      if (!node.isText || !node.text) {
        return;
      }

      const index = node.text.indexOf(text);
      if (index === -1) {
        return;
      }

      pos = nodePos + index + offset;
      return false;
    });

    expect(pos).toBeGreaterThan(-1);

    return pos;
  };

  const setTextSelection = (from: number, to: number) => {
    expect(to).toBeGreaterThan(from);

    editor.tiptap.chain().setTextSelection({ from, to }).run();
  };

  const setTextSelectionByText = (text: string) => {
    const from = findTextPosition(text);
    setTextSelection(from, from + text.length);
  };

  const setNodeSelectionByName = (name: string) => {
    let pos = -1;

    editor.tiptap.state.doc.descendants((node, nodePos) => {
      if (node.type.name !== name) {
        return;
      }

      pos = nodePos;
      return false;
    });

    expect(pos).toBeGreaterThan(-1);

    editor.tiptap.chain().setNodeSelection(pos).run();
  };

  beforeEach(() => {
    initElement();
  });

  afterEach(() => {
    document.querySelector<HTMLElement>(".modal")?.remove();
    element.remove();
    editor.destroy();
    textarea.remove();
  });

  describe("onClick", () => {
    it("should open modal without default target", async () => {
      await flush();
      await clickButton();

      expect(document.querySelector<HTMLSelectElement>(`select[id="link-target"]`)?.value).toBe(
        "_self"
      );
    });

    it("should open modal with default target _blank", async () => {
      initElement({
        toolbarOptions: {
          link: {
            defaultTarget: "_blank",
          },
        },
      });

      await flush();
      await clickButton();

      expect(document.querySelector<HTMLSelectElement>(`select[id="link-target"]`)?.value).toBe(
        "_blank"
      );
    });

    it("should allow editing selected plain text", async () => {
      editor.setContent("<p>text value</p>");
      setTextSelectionByText("text");

      await flush();
      await clickButton();

      expect(document.querySelector<HTMLInputElement>(`input[id="link-text"]`)?.value).toBe("text");

      setModalValue("link-url", "https://example.com");
      setModalValue("link-text", "link");
      await submitModal();

      expect(normalizeHTML(editor.getContent())).toBe(
        normalizeHTML("<p><a href='https://example.com' target='_self' title=''>link</a> value</p>")
      );
    });

    it("should keep image content and hide link text input", async () => {
      editor.setContent(
        "<p><span><img alt='v' class='v' height='v' src='v' style='top:0' title='v' width='v' /></span></p>"
      );
      setNodeSelectionByName("image");

      await flush();
      await clickButton();

      expect(document.querySelector<HTMLInputElement>(`input[id="link-text"]`)).toBeNull();

      setModalValue("link-url", "https://example.com");
      await submitModal();

      expect(normalizeHTML(editor.getContent())).toBe(
        normalizeHTML(
          "<p><a href='https://example.com' target='_self' title=''><span><img alt='v' class='v' height='v' src='v' style='top:0' title='v' width='v' /></span></a></p>"
        )
      );
    });

    it("should allow editing selected decorated text", async () => {
      editor.setContent("<p><strong>abcdefg</strong></p>");
      setTextSelectionByText("cde");

      await flush();
      await clickButton();

      expect(document.querySelector<HTMLInputElement>(`input[id="link-text"]`)?.value).toBe("cde");

      setModalValue("link-url", "https://example.com");
      setModalValue("link-text", "updated");
      await submitModal();

      expect(normalizeHTML(editor.getContent())).toBe(
        normalizeHTML(
          "<p><strong>ab</strong><a href='https://example.com' target='_self' title=''><strong>updated</strong></a><strong>fg</strong></p>"
        )
      );
    });

    it("should update an existing decorated link while preserving marks", async () => {
      editor.setContent(
        "<p><strong><a href='https://old.example' target='_self'>cde</a></strong></p>"
      );
      setTextSelectionByText("cde");

      await flush();
      await clickButton();

      expect(document.querySelector<HTMLInputElement>(`input[id="link-url"]`)?.value).toBe(
        "https://old.example"
      );
      expect(document.querySelector<HTMLInputElement>(`input[id="link-text"]`)?.value).toBe("cde");

      setModalValue("link-url", "https://example.com");
      setModalValue("link-title", "updated");
      setModalValue("link-text", "new");
      await submitModal();

      expect(normalizeHTML(editor.getContent())).toBe(
        normalizeHTML(
          "<p><a href='https://example.com' target='_self' title='updated'><strong>new</strong></a></p>"
        )
      );
    });

    it("should hide link text input for mixed-mark text selection", async () => {
      editor.setContent("<p>あい<strong>う</strong>え</p>");
      setTextSelection(findTextPosition("い"), findTextPosition("う") + 1);

      await flush();
      await clickButton();

      expect(document.querySelector<HTMLInputElement>(`input[id="link-text"]`)).toBeNull();

      setModalValue("link-url", "https://example.com");
      await submitModal();

      expect(normalizeHTML(editor.getContent())).toBe(
        normalizeHTML(
          "<p>あ<a href='https://example.com' target='_self' title=''>い<strong>う</strong></a>え</p>"
        )
      );
    });

    it("should keep empty-selection insertion behavior", async () => {
      editor.setContent("<p></p>");

      await flush();
      await clickButton();

      expect(document.querySelector<HTMLInputElement>(`input[id="link-text"]`)?.value).toBe("");

      setModalValue("link-url", "https://example.com");
      await flush();
      await submitModal();

      expect(normalizeHTML(editor.getContent())).toBe(
        normalizeHTML(
          "<p><a href='https://example.com' target='_self' title=''>https://example.com</a></p>"
        )
      );
    });
  });
});
