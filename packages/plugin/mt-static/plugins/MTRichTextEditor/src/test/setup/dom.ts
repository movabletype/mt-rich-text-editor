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
