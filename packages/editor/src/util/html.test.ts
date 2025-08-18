import { cssSize } from "./html";

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
