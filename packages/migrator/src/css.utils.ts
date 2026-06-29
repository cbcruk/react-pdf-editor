import type { ReactPdfStyle } from "./migrator.types.ts";

const SUPPORTED = new Set([
  "color",
  "backgroundColor",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "fontFamily",
  "textAlign",
  "textDecoration",
  "lineHeight",
  "letterSpacing",
  "opacity",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "width",
  "height",
  "display",
  "flexDirection",
  "justifyContent",
  "alignItems",
  "flexGrow",
  "flexShrink",
  "flex",
  "gap",
  "borderRadius",
  "borderWidth",
  "borderColor",
  "position",
  "top",
  "right",
  "bottom",
  "left",
]);

const LENGTH_PROPS = new Set([
  "fontSize",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "width",
  "height",
  "gap",
  "borderRadius",
  "borderWidth",
  "letterSpacing",
  "top",
  "right",
  "bottom",
  "left",
]);

function toCamelCase(prop: string): string {
  return prop.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
}

const BORDER_STYLE_KEYWORDS = new Set([
  "solid",
  "dashed",
  "dotted",
  "double",
  "none",
  "hidden",
  "groove",
  "ridge",
  "inset",
  "outset",
]);

function parseBorderShorthand(value: string): {
  width?: number;
  color?: string;
} {
  let width: number | undefined;
  let color: string | undefined;

  for (const token of value.trim().split(/\s+/)) {
    const pixels = /^(\d*\.?\d+)px$/.exec(token);
    if (pixels?.[1]) {
      width = Number(pixels[1]);
      continue;
    }

    if (BORDER_STYLE_KEYWORDS.has(token)) {
      continue;
    }

    color = token;
  }

  return { width, color };
}

function parseValue(prop: string, raw: string): string | number | null {
  const value = raw.trim();

  if (LENGTH_PROPS.has(prop)) {
    const pixels = /^(-?\d*\.?\d+)px$/.exec(value);
    if (pixels?.[1]) {
      return Number(pixels[1]);
    }

    const unitless = /^(-?\d*\.?\d+)$/.exec(value);
    if (unitless?.[1]) {
      return Number(unitless[1]);
    }
  }

  return value === "" ? null : value;
}

export function parseInlineStyle(styleAttr: string | undefined): ReactPdfStyle {
  const style: ReactPdfStyle = {};

  if (!styleAttr) {
    return style;
  }

  for (const declaration of styleAttr.split(";")) {
    const separator = declaration.indexOf(":");
    if (separator === -1) {
      continue;
    }

    const prop = toCamelCase(declaration.slice(0, separator).trim());
    const rawValue = declaration.slice(separator + 1).trim();

    if (rawValue === "") {
      continue;
    }

    if (prop === "border") {
      const { width, color } = parseBorderShorthand(rawValue);
      if (width !== undefined) {
        style.borderWidth = width;
      }
      if (color) {
        style.borderColor = color;
      }
      continue;
    }

    if (!SUPPORTED.has(prop)) {
      continue;
    }

    const parsed = parseValue(prop, rawValue);
    if (parsed !== null) {
      style[prop] = parsed;
    }
  }

  return style;
}
