import {
  normalizeToolbarData,
  parseToolbarData,
  parseToolbarItemIds,
  serializeToolbarData,
} from "./toolbar-data";

describe("toolbar settings data", () => {
  it("removes duplicate item IDs from each group when reading", () => {
    expect(parseToolbarData('[[[["bold","bold","italic"]],[]]]')).toEqual([
      [[["bold", "italic"]], []],
    ]);
  });

  it("keeps the same item ID when it belongs to different groups", () => {
    expect(parseToolbarData('[[[["bold"],["bold"]],[]]]')).toEqual([[[["bold"], ["bold"]], []]]);
  });

  it("normalizes duplicate item IDs before saving", () => {
    expect(serializeToolbarData([[[["bold", "bold", "italic"]], []]])).toBe(
      '[[[["bold","italic"]],[]]]'
    );
  });

  it("falls back to an empty toolbar for invalid JSON or data shapes", () => {
    expect(parseToolbarData("not json")).toEqual([]);
    expect(parseToolbarData('{"toolbar":[]}')).toEqual([]);
    expect(
      normalizeToolbarData([
        null,
        [[null, ["bold", null, "bold", ""]], "invalid side"],
        "invalid row",
      ])
    ).toEqual([[[["bold"]], []]]);
  });

  it("removes duplicate and invalid available item IDs", () => {
    expect(parseToolbarItemIds('["bold","bold",null,"italic",""]')).toEqual(["bold", "italic"]);
    expect(parseToolbarItemIds("not json")).toEqual([]);
  });
});
