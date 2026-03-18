import type { EditorOptions } from "../../editor";
import { mountEditorElement } from "../../test/helpers/editor";
import type { MountedEditorElement } from "../../test/helpers/editor";
import { PasteMenuItemElement } from "./element";
import Markdown from "./Markdown.svelte";

describe("Markdown", () => {
  let element: HTMLElement & PasteMenuItemElement;
  let harness: MountedEditorElement<HTMLElement & PasteMenuItemElement>;

  const initElement = (options: Partial<EditorOptions> = {}) => {
    harness?.cleanup();
    harness = mountEditorElement<HTMLElement & PasteMenuItemElement>({
      tagName: "mt-paste-menu-item-markdown",
      elementClass: Markdown.element!,
      editorOptions: options,
      getInitOptions: (mountedEditor) =>
        (mountedEditor.options.toolbarOptions?.link || {}) as Record<string, unknown>,
    });
    ({ element } = harness);
  };

  beforeEach(() => {
    initElement();
  });

  afterEach(() => {
    harness.cleanup();
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
