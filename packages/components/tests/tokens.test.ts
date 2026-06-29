import { expect, test } from "vite-plus/test";
import { createTokens, darkTheme, defaultTokens } from "../src/tokens.ts";

test("createTokens merges nested overrides over the defaults", () => {
  const themed = createTokens({
    fontFamily: "Noto Sans KR",
    color: { accent: "#ff0000" },
  });

  expect(themed.fontFamily).toBe("Noto Sans KR");
  expect(themed.color.accent).toBe("#ff0000");
  expect(themed.color.text).toBe(defaultTokens.color.text);
  expect(themed.space).toEqual(defaultTokens.space);
});

test("createTokens with no overrides equals the defaults", () => {
  expect(createTokens()).toEqual(defaultTokens);
});

test("darkTheme overrides colors but keeps the default scale", () => {
  expect(darkTheme.color.text).toBe("#f3f4f6");
  expect(darkTheme.color.text).not.toBe(defaultTokens.color.text);
  expect(darkTheme.space).toEqual(defaultTokens.space);
  expect(darkTheme.fontFamily).toBe(defaultTokens.fontFamily);
});
