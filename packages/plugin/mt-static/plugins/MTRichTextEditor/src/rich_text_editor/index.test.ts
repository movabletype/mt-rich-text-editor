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

type TiptapEditorMock = {
  on: ReturnType<typeof vi.fn>;
  commands: {
    applyUploadSessionResults: ReturnType<typeof vi.fn>;
    cancelUploadSession: ReturnType<typeof vi.fn>;
  };
};

type FileHandlerOptions = {
  onDrop?: (...args: unknown[]) => void;
  onPaste?: (
    editor: TiptapEditorMock,
    files: File[],
    pasteContent?: string,
    sessionId?: string
  ) => void;
};

describe("MTRichTextEditor", () => {
  let createMock: ReturnType<typeof vi.fn>;
  let applyUploadSessionResultsMock: ReturnType<typeof vi.fn>;
  let cancelUploadSessionMock: ReturnType<typeof vi.fn>;
  let tiptapMock: TiptapEditorMock;

  beforeEach(async () => {
    vi.resetModules();
    registerMock.mockClear();
    MockMTEditor.defaultCommonOptions = {};
    (window as unknown as { Lexicon: Record<string, string> }).Lexicon = {};
    window.MT = {} as typeof window.MT;
    document.body.innerHTML = "";

    applyUploadSessionResultsMock = vi.fn();
    cancelUploadSessionMock = vi.fn();
    tiptapMock = {
      on: vi.fn(),
      commands: {
        applyUploadSessionResults: applyUploadSessionResultsMock,
        cancelUploadSession: cancelUploadSessionMock,
      },
    };

    createMock = vi.fn(async (options: Record<string, unknown>) => ({
      ...options,
      tiptap: tiptapMock,
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

  it("cancels a pasted upload session when AssetUploader is unavailable", async () => {
    await createInstance("test-editor").initEditor("wysiwyg");

    const options = createMock.mock.calls[0][0] as {
      extensionOptions: { fileHandler: FileHandlerOptions };
    };
    expect(options.extensionOptions.fileHandler.onDrop).toEqual(expect.any(Function));

    const files = [new File(["image"], "pasted-image-1.png", { type: "image/png" })];
    options.extensionOptions.fileHandler.onPaste?.(tiptapMock, files, undefined, "session-1");

    expect(cancelUploadSessionMock).toHaveBeenCalledWith("session-1");
    expect(applyUploadSessionResultsMock).not.toHaveBeenCalled();
  });

  it("routes clipboard files without a session through the drop flow", async () => {
    const openMock = vi.fn();
    window.MT = {
      AssetUploader: { open: openMock },
    } as unknown as typeof window.MT;
    const canUpload = document.createElement("script");
    canUpload.dataset.mtRichTextEditorCanUpload = "1";
    document.body.appendChild(canUpload);

    await createInstance("test-editor").initEditor("wysiwyg");

    const options = createMock.mock.calls[0][0] as {
      extensionOptions: { fileHandler: FileHandlerOptions };
    };
    const files = [new File(["image"], "screenshot.png", { type: "image/png" })];
    options.extensionOptions.fileHandler.onPaste?.(tiptapMock, files, undefined, undefined);

    expect(openMock).toHaveBeenCalledWith(expect.objectContaining({ selectMetaData: true, files }));
    expect(applyUploadSessionResultsMock).not.toHaveBeenCalled();
    expect(cancelUploadSessionMock).not.toHaveBeenCalled();
  });

  it("applies results and cancels upload session images through AssetUploader", async () => {
    const openMock = vi.fn();
    window.MT = {
      AssetUploader: { open: openMock },
    } as unknown as typeof window.MT;
    const canUpload = document.createElement("script");
    canUpload.dataset.mtRichTextEditorCanUpload = "1";
    document.body.appendChild(canUpload);

    await createInstance("test-editor").initEditor("wysiwyg");

    const options = createMock.mock.calls[0][0] as {
      extensionOptions: { fileHandler: FileHandlerOptions };
    };
    const files = [new File(["image"], "pasted-image-1.png", { type: "image/png" })];
    options.extensionOptions.fileHandler.onPaste?.(tiptapMock, files, undefined, "session-1");

    expect(openMock).toHaveBeenCalledWith(
      expect.objectContaining({
        selectMetaData: false,
        multiSelect: true,
        params: {},
        initialSelectedData: [],
        field: "test-editor",
        files,
        insert: expect.any(Function),
        close: expect.any(Function),
      })
    );

    const uploaderOptions = openMock.mock.calls[0][0] as MTAssetUploaderOpenOptions;
    uploaderOptions.insert?.([
      {
        assetId: "101",
        assetUrl: "/assets/image.png",
        html: '<img data-mt-asset-id="101" src="/assets/image.png"/>',
      },
    ]);
    expect(applyUploadSessionResultsMock).toHaveBeenCalledWith("session-1", [
      {
        index: 0,
        attributes: { src: "/assets/image.png", "data-mt-asset-id": "101" },
      },
    ]);

    uploaderOptions.close?.();
    expect(cancelUploadSessionMock).toHaveBeenCalledWith("session-1");
  });
});
