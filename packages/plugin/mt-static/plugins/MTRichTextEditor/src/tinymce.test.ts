import { convertToolbar } from "./tinymce";

describe("convertToolbar", () => {
  it("should convert a single toolbar line correctly", () => {
    const input = ["bold,italic | underline"];
    const expected = [["bold", "italic"], ["underline"]];

    expect(convertToolbar(input)).toEqual(expected);
  });

  it("should return already converted toolbar as is", () => {
    const input = [["bold", "italic"], [{ list: "bullet" }, { list: "ordered" }], ["clean"]];

    expect(convertToolbar(input)).toEqual(input);
  });

  it("should handle space-separated items correctly", () => {
    const input = ["bold italic | underline strike"];
    const expected = [
      ["bold", "italic"],
      ["underline", "strike"],
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
      ["strike", "mt_link", "mt_unlink"],
      [{ list: "bullet" }, { list: "ordered" }],
      [],
      [{ color: [] }, { background: [] }, "clean"],
      [],
      [{ align: "" }, { align: "center" }, { align: "right" }],
      [{ indent: "+1" }, { indent: "-1" }, { header: [] }],
    ];

    expect(convertToolbar(input)).toEqual(expected);
  });

  it("should convert multiple toolbar lines correctly", () => {
    const input = ["bold,italic | underline", "bullist,numlist | blockquote"];
    const expected = [
      ["bold", "italic"],
      ["underline"],
      [],
      [{ list: "bullet" }, { list: "ordered" }],
      ["blockquote"],
    ];

    expect(convertToolbar(input)).toEqual(expected);
  });

  it("should handle whitespace correctly", () => {
    const input = ["bold , italic|underline , strikethrough"];
    const expected = [
      ["bold", "italic"],
      ["underline", "strike"],
    ];

    expect(convertToolbar(input)).toEqual(expected);
  });

  it("should handle empty array", () => {
    const input: string[] = [];
    const expected: (string | Record<string, string | string[]>)[][] = [];

    expect(convertToolbar(input)).toEqual(expected);
  });
});
