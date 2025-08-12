import { Editor } from "../../editor";
import type { EditorOptions } from "../../editor";
import { PasteMenuItemElement } from "./element";
import Markdown from "./Markdown.svelte";

window.customElements.define("mt-paste-menu-item-markdown", Markdown.element!);

describe("Markdown", () => {
  let element: HTMLElement & PasteMenuItemElement;
  let textarea: HTMLTextAreaElement;
  let editor: Editor;

  const initElement = (options: Partial<EditorOptions> = {}) => {
    if (element && element.parentNode) {
      element.remove();
    }
    element = document.createElement("mt-paste-menu-item-markdown") as HTMLElement &
      PasteMenuItemElement;

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

  beforeEach(() => {
    initElement();
  });

  afterEach(() => {
    document.querySelector<HTMLElement>(".modal")?.remove();
    element.remove();
    editor.destroy();
    textarea.remove();
  });

  describe("isEditorItemAvailable", () => {
    describe("when `toHtml` option is not available", () => {
      it("should return false", async () => {
        expect(element.isEditorItemAvailable()).toBe(false);
      });
    });

    describe("when `toHtml` option is available", () => {
      beforeEach(() => {
        initElement({
          extensionOptions: {
            markdown: {
              toHtml: vi.fn(),
            },
          },
        });
      });

      it.each([
        "test",
        "<p>test</p>",
        "[[link:example.com|Link Text]]",
        ":PROPERTIES: :ID: abc123 :END:",
        "{color:red}Important text{color}",
        ".. note:: This is a notice",
        "server.port=8080 # Port configuration",
        "\\textbf{Bold text} \\emph{emphasized}",
        '@import url("style.css") screen;',
        'name: "config value" | default: "default"',
        "<color=#ff0000>Red text</color>",
        "%define VERSION 1.2.3",
      ])("should return false if content is not in markdown format: %s", (content) => {
        element.content = { plainText: content } as PasteMenuItemElement["content"];
        expect(element.isEditorItemAvailable()).toBe(false);
      });

      it.each([
        // markdown inline content by /^(#|```|- |\* |\d+\. |> |=+$|-+$)/m.test(this.content?.plainText ?? "")
        "# Heading 1",
        "## Heading 2",
        "### Heading 3",
        "```\ncode```",
        "- List item",
        "* Bullet point",
        "1. Numbered item",
        "10. Tenth item",
        "> Blockquote",
        "===",
        "---",
      ])("should return truthy value if content is in markdown format: %s", (content) => {
        element.content = { plainText: content } as PasteMenuItemElement["content"];
        expect(element.isEditorItemAvailable()).toBeTruthy();
      });

      it("should return PasteMenuItemElement.Priority.High if content is in markdown format, and htmlDocument is not available", async () => {
        element.content = { plainText: "* test" } as PasteMenuItemElement["content"];
        expect(element.isEditorItemAvailable()).toBe(PasteMenuItemElement.Priority.High);
      });

      it("should return PasteMenuItemElement.Priority.Default if content is in markdown format, and htmlDocument is available", async () => {
        element.content = {
          plainText: "* test",
          htmlDocument: new Document(),
        } as PasteMenuItemElement["content"];
        expect(element.isEditorItemAvailable()).toBe(PasteMenuItemElement.Priority.Default);
      });
    });
  });
});
