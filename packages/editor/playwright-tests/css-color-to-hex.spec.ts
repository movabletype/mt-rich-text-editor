import { expect, test, type Page } from "@playwright/test";

const cssColorToHex = async (page: Page, input: string): Promise<string | null> => {
  return page.evaluate(async (input) => {
    const { cssColorToHex } = await import("/src/util/html.ts");
    return cssColorToHex(input);
  }, input);
};

const cases: { input: string; expected: string | null }[] = [
  { input: "#ff0000", expected: "#ff0000" },
  { input: "red", expected: "#ff0000" },
  { input: "rgb(255, 0, 0)", expected: "#ff0000" },
  { input: "rgba(255, 0, 0, 0.5)", expected: null },
  { input: "rgb(255, 0, 0, 0.5)", expected: null }, // legacy comma syntax with alpha
  { input: "rgb(255 0 0 / 0.5)", expected: null }, // modern space+slash syntax
  { input: "transparent", expected: null },
  { input: "", expected: null },
  { input: "not-a-color", expected: null },
  { input: "#f00", expected: "#ff0000" }, // 3-digit hex shorthand
  { input: "hsl(0, 100%, 50%)", expected: "#ff0000" }, // color-space conversion
  { input: "#ff000080", expected: null }, // 8-digit hex with alpha
];

test.describe("cssColorToHex", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  for (const { input, expected } of cases) {
    test(`converts ${JSON.stringify(input)} to ${JSON.stringify(expected)}`, async ({ page }) => {
      expect(await cssColorToHex(page, input)).toBe(expected);
    });
  }
});
