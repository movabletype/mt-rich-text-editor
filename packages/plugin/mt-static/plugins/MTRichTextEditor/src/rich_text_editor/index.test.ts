vi.mock("@movabletype/mt-rich-text-editor/mt-rich-text-editor", () => ({}));

class MockMTEditor {
  static defaultCommonOptions: { content_css_list?: string[]; body_class_list?: string[] } = {};
  id: string;
  options?: Record<string, Record<string, unknown>>;

  constructor(id: string, options?: Record<string, Record<string, unknown>>) {
    this.id = id;
    this.options = options;
  }

  setDirty(): void {}
}

const registerMock = vi.fn();

vi.mock("@movabletype/app", () => ({
  MT: {
    Editor: MockMTEditor,
    EditorManager: {
      register: registerMock,
    },
  },
}));

type MTRichTextEditorInstance = {
  initEditor: (format: string, content?: string, height?: number) => Promise<void>;
};

describe("MTRichTextEditor content_css_list handling", () => {
  let createMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    registerMock.mockClear();
    MockMTEditor.defaultCommonOptions = {};
    (window as unknown as { Lexicon: Record<string, string> }).Lexicon = {};

    createMock = vi.fn(async (options: Record<string, unknown>) => ({
      ...options,
      tiptap: { on: vi.fn() },
    }));

    window.MTRichTextEditor = {
      on: vi.fn(),
      create: createMock,
      unload: vi.fn(),
    } as unknown as typeof window.MTRichTextEditor;

    await import("./index");
  });

  const createInstance = (id: string): MTRichTextEditorInstance => {
    const EditorClass = registerMock.mock.calls[0][1] as new (
      id: string,
      options: Record<string, Record<string, unknown>>
    ) => MTRichTextEditorInstance;
    return new EditorClass(id, { wysiwyg: {} });
  };

  it("splits a single entry containing comma-separated stylesheet URLs", async () => {
    MockMTEditor.defaultCommonOptions = { content_css_list: ["a.css,b.css"] };

    await createInstance("test-editor").initEditor("wysiwyg");

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ stylesheets: ["a.css", "b.css"] })
    );
  });

  it("trims whitespace around each comma-separated value", async () => {
    MockMTEditor.defaultCommonOptions = { content_css_list: [" a.css , b.css "] };

    await createInstance("test-editor").initEditor("wysiwyg");

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ stylesheets: ["a.css", "b.css"] })
    );
  });

  it("drops empty segments caused by leading/trailing/duplicate commas", async () => {
    MockMTEditor.defaultCommonOptions = { content_css_list: ["a.css,,", ",b.css", " , "] };

    await createInstance("test-editor").initEditor("wysiwyg");

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ stylesheets: ["a.css", "b.css"] })
    );
  });

  it("still supports a plain list of stylesheet URLs without commas", async () => {
    MockMTEditor.defaultCommonOptions = { content_css_list: ["a.css", "b.css"] };

    await createInstance("test-editor").initEditor("wysiwyg");

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ stylesheets: ["a.css", "b.css"] })
    );
  });

  it("does not set stylesheets when content_css_list is not configured", async () => {
    await createInstance("test-editor").initEditor("wysiwyg");

    expect(createMock.mock.calls[0][0]).not.toHaveProperty("stylesheets");
  });
});
