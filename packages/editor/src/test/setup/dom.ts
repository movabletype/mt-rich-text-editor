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
  files: FileList = Object.create(FileList.prototype);
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
