import { Editor } from "../../../editor";
import type { EditorOptions } from "../../../editor";
import type { MountedEditorElement } from "../../../test/helpers/editor";
import {
  flushMicrotasks,
  mountEditorElement,
  setNodeSelectionByName,
  setTextSelection,
  setTextSelectionByText,
  findTextPosition,
} from "../../../test/helpers/editor";
import { normalizeHTML } from "../../../util/html";
import type { ToolbarItemElement } from "../element";
import Button from "./Button.svelte";

describe("Button", () => {
  let element: HTMLElement & ToolbarItemElement;
  let editor: Editor;
  let harness: MountedEditorElement<HTMLElement & ToolbarItemElement>;

  const initElement = (options: Partial<EditorOptions> = {}) => {
    harness?.cleanup();
    harness = mountEditorElement<HTMLElement & ToolbarItemElement>({
      tagName: "mt-toolbar-item-link",
      elementClass: Button.element!,
      editorOptions: options,
      getInitOptions: (mountedEditor) =>
        (mountedEditor.options.toolbarOptions?.link || {}) as Record<string, unknown>,
    });
    ({ element, editor } = harness);
  };

  const clickButton = async () => {
    element.dispatchEvent(new MouseEvent("click"));
    await flushMicrotasks();
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
    await flushMicrotasks();
  };

  beforeEach(() => {
    initElement();
  });

  afterEach(() => {
    harness.cleanup();
  });

  describe("onClick", () => {
    it("should open modal without default target", async () => {
      await flushMicrotasks();
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

      await flushMicrotasks();
      await clickButton();

      expect(document.querySelector<HTMLSelectElement>(`select[id="link-target"]`)?.value).toBe(
        "_blank"
      );
    });

    it("should allow editing selected plain text", async () => {
      editor.setContent("<p>text value</p>");
      setTextSelectionByText(editor, "text");

      await flushMicrotasks();
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
      setNodeSelectionByName(editor, "image");

      await flushMicrotasks();
      await clickButton();

      expect(document.querySelector<HTMLInputElement>(`input[id="link-text"]`)).toBeNull();

      setModalValue("link-url", "https://example.com");
      await submitModal();

      expect(normalizeHTML(editor.getContent())).toBe(
        normalizeHTML(
          "<p><a href='https://example.com' target='_self' title=''><span><img alt='v' class='v' height='v' src='v' style='top: 0px;' title='v' width='v' /></span></a></p>"
        )
      );
    });

    it("should allow editing selected decorated text", async () => {
      editor.setContent("<p><strong>abcdefg</strong></p>");
      setTextSelectionByText(editor, "cde");

      await flushMicrotasks();
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
      setTextSelectionByText(editor, "cde");

      await flushMicrotasks();
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
      setTextSelection(editor, findTextPosition(editor, "い"), findTextPosition(editor, "う") + 1);

      await flushMicrotasks();
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

      await flushMicrotasks();
      await clickButton();

      expect(document.querySelector<HTMLInputElement>(`input[id="link-text"]`)?.value).toBe("");

      setModalValue("link-url", "https://example.com");
      await flushMicrotasks();
      await submitModal();

      expect(normalizeHTML(editor.getContent())).toBe(
        normalizeHTML(
          "<p><a href='https://example.com' target='_self' title=''>https://example.com</a></p>"
        )
      );
    });
  });
});
