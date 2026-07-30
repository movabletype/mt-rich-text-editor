const { openDialogMock } = vi.hoisted(() => ({
  openDialogMock: vi.fn(),
}));

vi.mock("../util/dialog", () => ({
  openDialog: openDialogMock,
}));

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
    openDialogMock.mockReset();
    MockMTEditor.defaultCommonOptions = {};
    (window as unknown as { Lexicon: Record<string, string> }).Lexicon = {};
    window.MT = {} as typeof window.MT;
    window.app = null;
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

  afterEach(() => {
    vi.useRealTimers();
  });

  it("cancels a pasted upload session when uploads are not permitted", async () => {
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

  it("applies upload results to pasted images when the legacy uploader inserts HTML", async () => {
    vi.useFakeTimers();
    const canUpload = document.createElement("script");
    canUpload.dataset.mtRichTextEditorCanUpload = "1";
    document.body.appendChild(canUpload);

    const dialogIframe = document.createElement("iframe");
    dialogIframe.id = "mt-dialog-iframe";
    document.body.appendChild(dialogIframe);
    const win = dialogIframe.contentWindow!;
    Object.defineProperty(win.document, "readyState", {
      configurable: true,
      value: "complete",
    });
    win.document.body.innerHTML = `
      <form id="upload"></form>
      <div id="upload-progress"></div>
    `;
    const uploadFilesMock = vi.fn<(files: File[]) => void>((files) => {
      const uploadProgress = win.document.querySelector("#upload-progress")!;
      files.forEach(() => {
        uploadProgress.insertAdjacentHTML(
          "beforeend",
          '<div class="upload-status-block"><div class="upload-thumbnail"></div></div>'
        );
      });
    });
    win.uploadFiles = uploadFilesMock;
    win.jQuery = {} as typeof window.jQuery;

    const originalInsertHTMLMock = vi.fn();
    const app = {
      getIndirectMethod: vi.fn(),
      insertHTML: originalInsertHTMLMock,
    };
    window.app = app as unknown as NonNullable<typeof window.app>;

    let dialogDisposed: (() => void) | undefined;
    window.jQuery = vi.fn(() => ({
      one: (event: string, callback: () => void) => {
        expect(event).toBe("dialogDisposed");
        dialogDisposed = callback;
      },
    })) as unknown as typeof window.jQuery;

    await createInstance("test-editor").initEditor("wysiwyg");

    const options = createMock.mock.calls[0][0] as {
      extensionOptions: { fileHandler: FileHandlerOptions };
    };
    const files = [
      new File(["first"], "pasted-image-1.png", { type: "image/png" }),
      new File(["second"], "pasted-image-2.png", { type: "image/png" }),
      new File(["third"], "pasted-image-3.png", { type: "image/png" }),
      new File(["fourth"], "pasted-image-4.png", { type: "image/png" }),
    ];
    options.extensionOptions.fileHandler.onPaste?.(tiptapMock, files, undefined, "session-1");

    const params = openDialogMock.mock.calls[0][0] as URLSearchParams;
    expect(params.get("__mode")).toBe("dialog_asset_modal");
    expect(params.get("edit_field")).toBe("test-editor");
    expect(params.get("asset_select")).toBe("1");
    expect(params.has("no_insert")).toBe(false);

    await vi.advanceTimersByTimeAsync(100);

    expect(uploadFilesMock).toHaveBeenCalledWith(files);
    const uploadForm = win.document.querySelector<HTMLFormElement>("#upload")!;
    expect(uploadForm.style.getPropertyValue("display")).toBe("none");
    expect(uploadForm.style.getPropertyPriority("display")).toBe("important");
    expect(applyUploadSessionResultsMock).not.toHaveBeenCalled();

    const uploadBlocks = Array.from(
      win.document.querySelectorAll<HTMLElement>(".upload-status-block")
    );
    [
      [3, "104", "/assets/4.png"],
      [0, "101", "/assets/1.png"],
      [2, "103", "/assets/3.png"],
      [1, "102", "/assets/2.png"],
    ].forEach(([index, assetId, assetUrl]) => {
      const block = uploadBlocks[Number(index)];
      block.dataset.assetId = String(assetId);
      block.querySelector(".upload-thumbnail")!.innerHTML = `<a href="${assetUrl}">uploaded</a>`;
    });
    await Promise.resolve();

    const interceptedInsertHTML = app.insertHTML;
    expect(interceptedInsertHTML).not.toBe(originalInsertHTMLMock);
    interceptedInsertHTML(
      [
        '<a href="/assets/4.png">edited fourth label</a>',
        '<a href="/assets/1.png">edited first label</a>',
        '<a href="/assets/3.png">edited third label</a>',
        '<a href="/assets/2.png">edited second label</a>',
      ].join(""),
      // The legacy app ignores this argument, so it is not guaranteed to match the editor id.
      "content"
    );
    expect(applyUploadSessionResultsMock).toHaveBeenCalledWith("session-1", [
      {
        index: 3,
        attributes: { src: "/assets/4.png", "data-mt-asset-id": "104" },
      },
      {
        index: 0,
        attributes: { src: "/assets/1.png", "data-mt-asset-id": "101" },
      },
      {
        index: 2,
        attributes: { src: "/assets/3.png", "data-mt-asset-id": "103" },
      },
      {
        index: 1,
        attributes: { src: "/assets/2.png", "data-mt-asset-id": "102" },
      },
    ]);
    expect(originalInsertHTMLMock).not.toHaveBeenCalled();
    expect(app.insertHTML).toBe(originalInsertHTMLMock);
    expect(cancelUploadSessionMock).not.toHaveBeenCalled();

    dialogDisposed?.();
    expect(cancelUploadSessionMock).toHaveBeenCalledWith("session-1");
  });

  it("restores insertHTML and cancels an upload session when the legacy uploader closes", async () => {
    vi.useFakeTimers();
    const canUpload = document.createElement("script");
    canUpload.dataset.mtRichTextEditorCanUpload = "1";
    document.body.appendChild(canUpload);

    const dialogIframe = document.createElement("iframe");
    dialogIframe.id = "mt-dialog-iframe";
    document.body.appendChild(dialogIframe);
    const uploadFilesMock = vi.fn<(files: File[]) => void>();
    dialogIframe.contentWindow!.uploadFiles = uploadFilesMock;
    dialogIframe.contentWindow!.jQuery = {} as typeof window.jQuery;

    const originalInsertHTMLMock = vi.fn();
    const app = {
      getIndirectMethod: vi.fn(),
      insertHTML: originalInsertHTMLMock,
    };
    window.app = app as unknown as NonNullable<typeof window.app>;

    let dialogDisposed: (() => void) | undefined;
    window.jQuery = vi.fn(() => ({
      one: (event: string, callback: () => void) => {
        expect(event).toBe("dialogDisposed");
        dialogDisposed = callback;
      },
    })) as unknown as typeof window.jQuery;

    await createInstance("test-editor").initEditor("wysiwyg");
    const options = createMock.mock.calls[0][0] as {
      extensionOptions: { fileHandler: FileHandlerOptions };
    };
    const files = [new File(["image"], "image.png", { type: "image/png" })];
    options.extensionOptions.fileHandler.onPaste?.(tiptapMock, files, undefined, "session-1");

    expect(app.insertHTML).not.toBe(originalInsertHTMLMock);
    dialogDisposed?.();
    await vi.advanceTimersByTimeAsync(100);

    expect(app.insertHTML).toBe(originalInsertHTMLMock);
    expect(uploadFilesMock).not.toHaveBeenCalled();
    expect(applyUploadSessionResultsMock).not.toHaveBeenCalled();
    expect(cancelUploadSessionMock).toHaveBeenCalledWith("session-1");
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
