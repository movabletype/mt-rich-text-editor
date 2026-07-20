import { toUploadResults } from "./upload_session";

const pastedFile = (name: string): File => new File([""], name);

describe("toUploadResults", () => {
  it("maps the newest-first payload back to the original file order", () => {
    expect(
      toUploadResults(
        [
          { assetId: "85", assetUrl: "/assets/85.png" },
          { assetId: "84", assetUrl: "/assets/84.png", html: "<img ...>", align: "none" },
        ],
        [pastedFile("file1.png"), pastedFile("file2.png")]
      )
    ).toEqual([
      {
        index: 0,
        attributes: { src: "/assets/84.png", "data-mt-asset-id": "84" },
      },
      {
        index: 1,
        attributes: { src: "/assets/85.png", "data-mt-asset-id": "85" },
      },
    ]);
  });

  it("omits the asset id attribute when assetId is absent", () => {
    expect(toUploadResults([{ assetUrl: "/assets/a.png" }], [pastedFile("file1.png")])).toEqual([
      { index: 0, attributes: { src: "/assets/a.png" } },
    ]);
  });

  it("skips entries without an assetUrl while keeping the reverse mapping", () => {
    expect(
      toUploadResults(
        [{}, { assetId: "85", assetUrl: "/assets/85.png" }],
        [pastedFile("file1.png"), pastedFile("file2.png")]
      )
    ).toEqual([
      {
        index: 0,
        attributes: { src: "/assets/85.png", "data-mt-asset-id": "85" },
      },
    ]);
  });

  it("skips pasted files whose extension is missing from the results", () => {
    expect(
      toUploadResults(
        [
          { assetId: "2", assetUrl: "/assets/upload2.png" },
          { assetId: "1", assetUrl: "/assets/upload1.png" },
        ],
        [pastedFile("file1.png"), pastedFile("file2.svg"), pastedFile("file3.png")]
      )
    ).toEqual([
      {
        index: 0,
        attributes: { src: "/assets/upload1.png", "data-mt-asset-id": "1" },
      },
      {
        index: 2,
        attributes: { src: "/assets/upload2.png", "data-mt-asset-id": "2" },
      },
    ]);
  });

  it("matches extensions case-insensitively and ignores query strings", () => {
    expect(
      toUploadResults(
        [{ assetId: "1", assetUrl: "/assets/UPLOAD1.PNG?v=2" }],
        [pastedFile("file1.svg"), pastedFile("file2.png")]
      )
    ).toEqual([
      {
        index: 1,
        attributes: { src: "/assets/UPLOAD1.PNG?v=2", "data-mt-asset-id": "1" },
      },
    ]);
  });

  it("drops results that match no remaining pasted file", () => {
    expect(
      toUploadResults(
        [
          { assetId: "2", assetUrl: "/assets/upload2.gif" },
          { assetId: "1", assetUrl: "/assets/upload1.png" },
        ],
        [pastedFile("file1.png")]
      )
    ).toEqual([
      {
        index: 0,
        attributes: { src: "/assets/upload1.png", "data-mt-asset-id": "1" },
      },
    ]);
  });
});
