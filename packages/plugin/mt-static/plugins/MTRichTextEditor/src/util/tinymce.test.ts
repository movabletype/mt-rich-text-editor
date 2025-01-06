import { convertToolbar } from "./tinymce";

describe("convertToolbar", () => {
  it("should convert a single toolbar line correctly", () => {
    const input = ["bold,italic | underline"];
    const expected = [[["bold", "italic"], ["underline"]]];

    expect(convertToolbar(input)).toEqual(expected);
  });

  it("should return already converted toolbar as is", () => {
    const input = [[[["bold", "italic"], ["bulletList", "orderedList"], ["clean"]]]];

    expect(convertToolbar(input)).toEqual(input);
  });

  it("should handle space-separated items correctly", () => {
    const input = ["bold italic | underline strike"];
    const expected = [
      [
        ["bold", "italic"],
        ["underline", "strike"],
      ],
    ];

    expect(convertToolbar(input)).toEqual(expected);
  });

  it("should convert all toolbar migration mappings correctly", () => {
    const input = [
      "strikethrough,link,unlink | bullist,numlist",
      "forecolor,backcolor,removeformat",
      "alignleft,aligncenter,alignright | indent,outdent,blocks",
    ];
    const expected = [
      [
        ["strike", "link", "unlink"],
        ["bulletList", "orderedList"],
      ],
      [["foregroundColor", "backgroundColor", "removeFormat"]],
      [
        ["alignLeft", "alignCenter", "alignRight"],
        ["indent", "outdent", "block"],
      ],
    ];

    expect(convertToolbar(input)).toEqual(expected);
  });

  it("should handle whitespace correctly", () => {
    const input = ["bold , italic|underline , strikethrough"];
    const expected = [
      [
        ["bold", "italic"],
        ["underline", "strike"],
      ],
    ];

    expect(convertToolbar(input)).toEqual(expected);
  });

  it("should handle empty array", () => {
    const input: string[] = [];
    const expected: (string | Record<string, string | string[]>)[][] = [];

    expect(convertToolbar(input)).toEqual(expected);
  });
});
