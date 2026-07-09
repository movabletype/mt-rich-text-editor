describe("EditorManager", () => {
  const createTextarea = (id: string, value = "") => {
    const textarea = document.createElement("textarea");
    textarea.id = id;
    textarea.value = value;
    document.body.appendChild(textarea);
    return textarea;
  };

  beforeEach(() => {
    document.body.innerHTML = "";
    localStorage.clear();
    sessionStorage.clear();
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

  it("creates an editor with default options and exposes it via get()", async () => {
    createTextarea("editor");
    const { EditorManager } = await import("./editor-manager");
    const createHandler = vi.fn();
    const initHandler = vi.fn();

    EditorManager.on("create", createHandler);
    EditorManager.on("init", initHandler);

    const editor = await EditorManager.create({ id: "editor" });

    expect(createHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "editor",
        inline: false,
        statusbar: [["path"]],
        pasteMenu: ["embedInline", "embed", "html", "link", "text", "markdown"],
        quickAction: ["heading:1", "heading:2", "heading:3", "heading:4", "heading:5", "heading:6"],
      })
    );
    expect(initHandler).toHaveBeenCalledWith(editor);
    expect(EditorManager.get({ id: "editor" })).toBe(editor);
  });

  it("allows create handlers to mutate the final editor options", async () => {
    createTextarea("editor");
    const { EditorManager } = await import("./editor-manager");

    EditorManager.on("create", (options) => {
      options.inline = true;
      options.toolbar = [[[["bold"]]]];
    });

    const editor = await EditorManager.create({ id: "editor" });

    expect(editor.options.inline).toBe(true);
    expect(editor.options.toolbar).toEqual([[[["bold"]]]]);
  });

  it("throws when the textarea does not exist", async () => {
    const { EditorManager } = await import("./editor-manager");

    await expect(EditorManager.create({ id: "missing" })).rejects.toThrow("Textarea not found");
  });

  it("throws when an editor already exists for the same id", async () => {
    createTextarea("editor");
    const { EditorManager } = await import("./editor-manager");

    await EditorManager.create({ id: "editor" });

    await expect(EditorManager.create({ id: "editor" })).rejects.toThrow("Editor already exists");
  });

  it("saves all managed editors back to their textareas", async () => {
    const first = createTextarea("editor-1");
    const second = createTextarea("editor-2");
    const { EditorManager } = await import("./editor-manager");

    const editor1 = await EditorManager.create({ id: "editor-1" });
    const editor2 = await EditorManager.create({ id: "editor-2" });
    editor1.tiptap.commands.setContent("<p>First</p>");
    editor2.tiptap.commands.setContent("<p>Second</p>");

    await EditorManager.save();

    expect(first.value).toBe("<p>First</p>");
    expect(second.value).toBe("<p>Second</p>");
  });

  it("unloads editors and destroys the managed instance", async () => {
    createTextarea("editor");
    const { EditorManager } = await import("./editor-manager");

    const editor = await EditorManager.create({ id: "editor" });
    const destroySpy = vi.spyOn(editor, "destroy");

    EditorManager.unload({ id: "editor" });

    expect(destroySpy).toHaveBeenCalled();
    expect(EditorManager.get({ id: "editor" })).toBeUndefined();
  });

  it("imports @tiptap/core and rejects unknown modules", async () => {
    const { EditorManager } = await import("./editor-manager");
    const TiptapCore = await import("@tiptap/core");

    await expect(EditorManager.import("@tiptap/core")).resolves.toBe(TiptapCore);
    await expect(EditorManager.import("unknown" as "@tiptap/core")).rejects.toThrow(
      "Unknown module: unknown"
    );
  });

  it("changes language through create() and setLanguage()", async () => {
    createTextarea("editor");
    const { EditorManager } = await import("./editor-manager");
    const i18n = (await import("./i18n")).default;

    await EditorManager.create({ id: "editor", language: "ja" });
    expect(i18n.language).toBe("ja");

    EditorManager.setLanguage("en");
    expect(i18n.language).toBe("en");
  });
});
