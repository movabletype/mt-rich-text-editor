import { isSameOrigin } from "./dom";

describe("isSameOrigin", () => {
  it("should return true for same-origin URLs", () => {
    const attributes = {
      src: `${location.origin}/iframe.html`,
    };
    expect(isSameOrigin(attributes)).toBe(true);
  });

  it("should return false for same host but different port", () => {
    const attributes = {
      src: `${location.protocol}//${location.hostname}/iframe.html`,
    };
    expect(isSameOrigin(attributes)).toBe(false);
  });

  it("should return false for cross-origin URLs", () => {
    const attributes = {
      src: "https://example.com/iframe.html",
    };
    expect(isSameOrigin(attributes)).toBe(false);
  });

  it("should return true if srcdoc is present", () => {
    const attributes = {
      srcdoc: "<p>Hello World</p>",
    };
    expect(isSameOrigin(attributes)).toBe(true);
  });

  it("should return true if src is not present", () => {
    const attributes = {};
    expect(isSameOrigin(attributes)).toBe(true);
  });
});
