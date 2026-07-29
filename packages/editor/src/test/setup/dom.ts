const createMockFileList = (files: File[] = []): FileList => {
  const fileList: Record<number, File> & {
    length: number;
    item: (index: number) => File | null;
    [Symbol.iterator]: () => IterableIterator<File>;
  } = {
    length: files.length,
    item: (index: number) => files[index] ?? null,
    [Symbol.iterator]: () => files[Symbol.iterator](),
  };
  files.forEach((file, index) => {
    fileList[index] = file;
  });
  return fileList as unknown as FileList;
};

class MockDataTransfer implements DataTransfer {
  private data: Map<string, string>;
  dropEffect: "none" | "copy" | "link" | "move" = "none";
  effectAllowed:
    | "none"
    | "copy"
    | "link"
    | "move"
    | "copyLink"
    | "copyMove"
    | "linkMove"
    | "all"
    | "uninitialized" = "none";
  files: FileList = createMockFileList();
  items: DataTransferItemList = [] as unknown as DataTransferItemList; // TODO: implement mock DataTransferItemList
  types: readonly string[] = [];

  constructor() {
    this.data = new Map();
  }

  getData(format: string): string {
    return this.data.get(format) || "";
  }

  setData(format: string, data: string): void {
    this.data.set(format, data);
  }

  clearData(): void {
    this.data.clear();
  }

  setDragImage(): void {}
}

// Add DataTransfer to global
(global as unknown as { DataTransfer: typeof DataTransfer }).DataTransfer =
  MockDataTransfer as unknown as typeof DataTransfer;

// Add matchMedia to window if not present
window.matchMedia ??= function (query: string): MediaQueryList {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: function () {},
    removeListener: function () {},
    addEventListener: function () {},
    removeEventListener: function () {},
    dispatchEvent: function () {
      return false;
    },
  } as MediaQueryList;
};

window.trans = vi.fn((key: string) => key);

Object.defineProperty(window.HTMLElement.prototype, "animate", {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    play: vi.fn(),
    pause: vi.fn(),
    reverse: vi.fn(),
  })),
});
