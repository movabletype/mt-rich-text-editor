import {
  collectDataURLImageFiles,
  UPLOAD_SESSION_ID_ATTRIBUTE,
  UPLOAD_SESSION_INDEX_ATTRIBUTE,
} from "./util";

const PNG_1X1_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

describe("collectDataURLImageFiles", () => {
  const parse = (html: string): HTMLElement => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body;
  };

  it("keeps and stamps accepted images with sequential indexes and content-hash names", () => {
    const root = parse(
      `<p><img src="data:image/png;base64,${PNG_1X1_BASE64}">text<img src="data:image/png;base64,${PNG_1X1_BASE64}"></p>`
    );

    const files = collectDataURLImageFiles(root, {
      sessionId: "session-1",
      shouldUpload: () => true,
    });

    const images = root.querySelectorAll("img");
    expect(images).toHaveLength(2);
    expect(images[0].getAttribute(UPLOAD_SESSION_ID_ATTRIBUTE)).toBe("session-1");
    expect(images[0].getAttribute(UPLOAD_SESSION_INDEX_ATTRIBUTE)).toBe("0");
    expect(images[1].getAttribute(UPLOAD_SESSION_ID_ATTRIBUTE)).toBe("session-1");
    expect(images[1].getAttribute(UPLOAD_SESSION_INDEX_ATTRIBUTE)).toBe("1");
    expect(files).toHaveLength(2);
    expect(files[0].name).toBe("b2bbe763c7e1828c750d53f78550709a6fea19be.png");
    expect(files[1].name).toBe("b2bbe763c7e1828c750d53f78550709a6fea19be.png");
  });

  it("leaves http(s) images untouched", () => {
    const root = parse(`<p><img src="https://example.com/a.png"></p>`);

    const files = collectDataURLImageFiles(root, {
      sessionId: "session-1",
      shouldUpload: () => true,
    });

    expect(files).toHaveLength(0);
    expect(root.querySelector("img")).not.toBeNull();
  });

  it("removes rejected images and supported wrappers that become empty", () => {
    const root = parse(
      `<p><span>text </span><a><span><img src="data:image/png;base64,${PNG_1X1_BASE64}"></span></a></p>`
    );

    const files = collectDataURLImageFiles(root, {
      sessionId: "session-1",
      shouldUpload: () => false,
    });

    const p = root.querySelector("p");
    expect(files).toHaveLength(0);
    expect(p).not.toBeNull();
    expect(p?.querySelectorAll("span")).toHaveLength(1);
    expect(p?.querySelector("a")).toBeNull();
    expect(p?.textContent).toBe("text ");
  });

  it("preserves empty structural ancestors outside the supported wrapper list", () => {
    const root = parse(
      `<div data-container><p><img src="data:image/png;base64,${PNG_1X1_BASE64}"></p></div>`
    );

    collectDataURLImageFiles(root, {
      sessionId: "session-1",
      shouldUpload: () => false,
    });

    const container = root.querySelector("[data-container]");
    expect(container).not.toBeNull();
    expect(container?.children).toHaveLength(0);
  });

  it("removes unconvertible images but stops empty-ancestor cleanup at a table cell", () => {
    const root = parse(
      `<table><tr><td><span><img src="data:text/plain;base64,aGVsbG8="></span></td></tr></table>`
    );

    const files = collectDataURLImageFiles(root, {
      sessionId: "session-1",
      shouldUpload: () => true,
    });

    const td = root.querySelector("td");
    expect(files).toHaveLength(0);
    expect(td).not.toBeNull();
    expect(td?.querySelector("span")).toBeNull();
    expect(td?.querySelector("img")).toBeNull();
  });

  it("returns only files accepted by their content-hash names", () => {
    const root = parse(
      `<p><img src="data:image/svg+xml,%3Csvg%3E%3C/svg%3E"><img src="data:text/plain;base64,aGVsbG8="><img src="data:image/png;base64,${PNG_1X1_BASE64}"></p>`
    );

    const files = collectDataURLImageFiles(root, {
      sessionId: "session-1",
      shouldUpload: (file) => file.name === "b2bbe763c7e1828c750d53f78550709a6fea19be.png",
    });

    expect(files).toHaveLength(1);
    expect(files[0].name).toBe("b2bbe763c7e1828c750d53f78550709a6fea19be.png");
    expect(root.querySelectorAll("img")).toHaveLength(1);
    expect(root.querySelector("img")?.getAttribute(UPLOAD_SESSION_INDEX_ATTRIBUTE)).toBe("0");
  });
});
