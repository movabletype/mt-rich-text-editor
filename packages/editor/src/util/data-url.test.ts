import { dataURLToFile } from "./data-url";

const PNG_1X1_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

describe("dataURLToFile", () => {
  it("decodes a base64 PNG data URL into a File", () => {
    const file = dataURLToFile(`data:image/png;base64,${PNG_1X1_BASE64}`);

    expect(file).not.toBeNull();
    expect(file?.type).toBe("image/png");
    expect(file?.name).toBe("b2bbe763c7e1828c750d53f78550709a6fea19be.png");
  });

  it("decodes a percent-encoded SVG data URL into a File", () => {
    const file = dataURLToFile(
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E"
    );

    expect(file).not.toBeNull();
    expect(file?.type).toBe("image/svg+xml");
  });

  it("treats raw percent characters in non-base64 data as literals like browsers do", async () => {
    const file = dataURLToFile(
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'></svg>"
    );

    expect(file).not.toBeNull();
    expect(file?.type).toBe("image/svg+xml");
    await expect(file?.text()).resolves.toBe(
      "<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'></svg>"
    );
  });

  it("decodes valid escapes while keeping invalid ones literal in the same payload", async () => {
    const file = dataURLToFile("data:image/svg+xml,%3Csvg width='100%'%3E%3C/svg%3E");

    expect(file).not.toBeNull();
    await expect(file?.text()).resolves.toBe("<svg width='100%'></svg>");
  });

  it("decodes multi-byte UTF-8 percent-escape sequences", async () => {
    const file = dataURLToFile("data:image/svg+xml,%3Csvg%3E%E3%81%82%3C/svg%3E");

    expect(file).not.toBeNull();
    await expect(file?.text()).resolves.toBe("<svg>あ</svg>");
  });

  it("tolerates whitespace and newlines mixed into base64 data", () => {
    const withWhitespace = `${PNG_1X1_BASE64.slice(0, 10)}\n  ${PNG_1X1_BASE64.slice(10, 20)}\t${PNG_1X1_BASE64.slice(20)}`;
    const file = dataURLToFile(`data:image/png;base64,${withWhitespace}`);

    expect(file).not.toBeNull();
    expect(file?.type).toBe("image/png");
    expect(file?.name).toBe("b2bbe763c7e1828c750d53f78550709a6fea19be.png");
  });

  it("returns null for non-image mime types", () => {
    expect(dataURLToFile("data:text/plain;base64,aGVsbG8=")).toBeNull();
  });

  it("returns null instead of throwing for invalid base64 data", () => {
    expect(dataURLToFile("data:image/png;base64,not-valid-base64!!!")).toBeNull();
  });

  it("returns null for strings that are not data URLs", () => {
    expect(dataURLToFile("not-a-data-url")).toBeNull();
  });
});
