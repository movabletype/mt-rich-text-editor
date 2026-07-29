import { DEFAULT_BLOCK_ELEMENTS, DEFAULT_INLINE_ELEMENTS } from "../constant";
import { cssSize, normalizeHTML, preprocessHTML } from "./html";

describe("cssSize", () => {
  it.each`
    input      | expected
    ${"100"}   | ${"100px"}
    ${"-100"}  | ${"-100px"}
    ${"100.5"} | ${"100.5px"}
  `("should convert $input to $expected", ({ input, expected }) => {
    expect(cssSize(input)).toBe(expected);
  });

  it.each`
    input
    ${"0"}
    ${"100px"}
    ${"auto"}
    ${"50%"}
  `("should return $input as is", ({ input }) => {
    expect(cssSize(input)).toBe(input);
  });
});

describe("preprocessHTML", () => {
  const blockElements = DEFAULT_BLOCK_ELEMENTS;
  const inlineElements = DEFAULT_INLINE_ELEMENTS.concat([
    "a",
    "img",
    "br",
    "strong",
    "em",
    "u",
    "sub",
    "sup",
    "code",
    "script",
    "iframe",
    "mt-rich-text-editor-mt-function-tag",
  ]);

  it("wraps direct inline content in mt-text-block", () => {
    expect(
      preprocessHTML("<div>alpha<strong>beta</strong></div>", blockElements, inlineElements)
    ).toBe("<div><mt-text-block>alpha<strong>beta</strong></mt-text-block></div>");
  });

  it("adds an empty mt-text-block to empty block elements", () => {
    expect(preprocessHTML("<div> \n </div>", blockElements, inlineElements)).toBe(
      "<div><mt-text-block> \n </mt-text-block></div>"
    );
  });

  it("keeps an empty div empty (wrapped only in an empty mt-text-block)", () => {
    expect(preprocessHTML("<div></div>", blockElements, inlineElements)).toBe(
      "<div><mt-text-block></mt-text-block></div>"
    );
  });

  it("does not wrap whitespace-only text nodes surrounding a block child in mt-text-block", () => {
    expect(preprocessHTML("<div>\n  <p>test</p>\n</div>", blockElements, inlineElements)).toBe(
      "<div><p>test</p></div>"
    );
  });

  it("does not wrap whitespace-only text nodes surrounding a block child for blockquote/td as well", () => {
    expect(
      preprocessHTML("<blockquote>\n  <p>test</p>\n</blockquote>", blockElements, inlineElements)
    ).toBe("<blockquote><p>test</p></blockquote>");

    expect(
      preprocessHTML(
        "<table><tbody><tr><td>\n  <p>test</p>\n</td></tr></tbody></table>",
        blockElements,
        inlineElements
      )
    ).toBe("<table><tbody><tr><td><p>test</p></td></tr></tbody></table>");
  });

  it("still wraps direct inline content even when surrounded by whitespace-only text nodes", () => {
    expect(
      preprocessHTML("<div>\n  alpha<strong>beta</strong>\n</div>", blockElements, inlineElements)
    ).toBe("<div><mt-text-block>\n  alpha<strong>beta</strong>\n</mt-text-block></div>");
  });

  it("replaces editable script elements with mt-rich-text-editor-script", () => {
    expect(
      preprocessHTML(
        "<p><script data-role='x'>alert(1)</script></p>",
        blockElements,
        inlineElements
      )
    ).toBe(
      `<p><mt-rich-text-editor-script data-role="x">alert(1)</mt-rich-text-editor-script></p>`
    );
  });

  it("keeps embed-object descendants untouched", () => {
    expect(
      preprocessHTML(
        `<div data-mt-rich-text-editor-embed-object=""><div>alpha</div><script>x</script></div>`,
        blockElements,
        inlineElements
      )
    ).toBe(
      `<div data-mt-rich-text-editor-embed-object=""><div>alpha</div><script>x</script></div>`
    );
  });
});

describe("normalizeHTML", () => {
  it("unwraps mt-text-block and restores script elements", () => {
    expect(
      normalizeHTML(
        `<div><mt-text-block>alpha<strong>beta</strong></mt-text-block></div><p><mt-rich-text-editor-script data-role="x">alert(1)</mt-rich-text-editor-script></p>`
      )
    ).toBe(`<div>alpha<strong>beta</strong></div><p><script data-role="x">alert(1)</script></p>`);
  });

  it("removes transient text alignment attribute but preserves unrelated attributes", () => {
    expect(normalizeHTML(`<p textalign="" data-mt-indent="2">alpha</p>`)).toBe(
      `<p data-mt-indent="2">alpha</p>`
    );
  });

  it("removes upload session images but preserves existing data URL images", () => {
    expect(
      normalizeHTML(
        `<p><img src="data:image/png;base64,EXISTING"></p><p>before<img src="data:image/png;base64,PENDING" data-mt-rich-text-editor-upload-session="session-1" data-mt-rich-text-editor-upload-session-index="0">after</p>`
      )
    ).toBe(`<p><img src="data:image/png;base64,EXISTING"></p><p>beforeafter</p>`);
  });

  it("restores event attributes and embedded content payloads", () => {
    expect(
      normalizeHTML(
        `<iframe data-mt-rich-text-editor-event-attributes='{"srcdoc":"<p>x</p>","sandbox":"allow-scripts"}'></iframe><div data-mt-rich-text-editor-content="<p>inner</p>"></div>`
      )
    ).toBe(`<iframe srcdoc="<p>x</p>" sandbox="allow-scripts"></iframe><div><p>inner</p></div>`);
  });
});
