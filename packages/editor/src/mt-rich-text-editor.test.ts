describe("mt-rich-text-editor entrypoint", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.resetModules();
    const originalDefine = window.customElements.define.bind(window.customElements);
    vi.spyOn(window.customElements, "define").mockImplementation((name, constructor, options) => {
      if (!window.customElements.get(name)) {
        originalDefine(name, constructor, options);
      }
    });
  });

  afterEach(async () => {
    const { EditorManager } = await import("./editor-manager");
    Object.keys(EditorManager.Editors).forEach((id) => EditorManager.unload({ id }));
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("exposes EditorManager on window.MTRichTextEditor", async () => {
    const { default: EditorManager } = await import("./index");
    await import("./mt-rich-text-editor");

    expect(window.MTRichTextEditor).toBe(EditorManager);
  });

  it("allows creating editors through the global entrypoint", async () => {
    const textarea = document.createElement("textarea");
    textarea.id = "editor";
    textarea.value = "<p>Initial</p>";
    document.body.appendChild(textarea);

    await import("./mt-rich-text-editor");
    const editor = await window.MTRichTextEditor.create({ id: "editor" });

    expect(editor.getContent()).toBe("<p>Initial</p>");
    expect(window.MTRichTextEditor.get({ id: "editor" })).toBe(editor);
  });
});
