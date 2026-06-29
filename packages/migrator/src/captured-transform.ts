import { applyListMarkers, tagDefaultStyle, tagToComponent } from "./element-map.ts";
import { firstFamily } from "./font-collect.ts";
import type {
  CapturedElement,
  CapturedNode,
  CapturedTextNode,
  IrNode,
  ReactPdfStyle,
} from "./migrator.types.ts";

const INHERITED = new Set([
  "color",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "letterSpacing",
  "textAlign",
]);

const SPACING: ReadonlyArray<readonly [string, string]> = [
  ["paddingTop", "padding-top"],
  ["paddingRight", "padding-right"],
  ["paddingBottom", "padding-bottom"],
  ["paddingLeft", "padding-left"],
  ["marginTop", "margin-top"],
  ["marginRight", "margin-right"],
  ["marginBottom", "margin-bottom"],
  ["marginLeft", "margin-left"],
];

function pxNonZero(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const match = /^(-?\d*\.?\d+)px$/.exec(value.trim());
  if (!match?.[1]) {
    return null;
  }

  const num = Number(match[1]);
  return num === 0 ? null : Math.round(num);
}

function colorToHex(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const match = /^rgba?\(([^)]+)\)$/.exec(value.trim());
  if (!match?.[1]) {
    return value.trim();
  }

  const parts = match[1].split(",").map((part) => part.trim());
  const [r, g, b, a] = parts;
  if (a !== undefined && Number(a) === 0) {
    return null;
  }

  const hex = [r, g, b].map((channel) => Number(channel).toString(16).padStart(2, "0")).join("");
  return `#${hex}`;
}

function weight(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  if (value === "normal") {
    return null;
  }

  const num = value === "bold" ? 700 : Number(value);
  return Number.isNaN(num) || num === 400 ? null : num;
}

function translate(computed: Record<string, string>): ReactPdfStyle {
  const style: ReactPdfStyle = {};

  const color = colorToHex(computed.color);
  if (color) {
    style.color = color;
  }

  const fontFamily = firstFamily(computed["font-family"]);
  if (fontFamily) {
    style.fontFamily = fontFamily;
  }

  const background = colorToHex(computed["background-color"]);
  if (background) {
    style.backgroundColor = background;
  }

  const fontSize = pxNonZero(computed["font-size"]);
  if (fontSize !== null) {
    style.fontSize = fontSize;
  }

  const fontWeight = weight(computed["font-weight"]);
  if (fontWeight !== null) {
    style.fontWeight = fontWeight;
  }

  if (computed["font-style"] === "italic") {
    style.fontStyle = "italic";
  }

  const letterSpacing = pxNonZero(computed["letter-spacing"]);
  if (letterSpacing !== null) {
    style.letterSpacing = letterSpacing;
  }

  const textAlign = computed["text-align"];
  if (textAlign === "center" || textAlign === "right" || textAlign === "justify") {
    style.textAlign = textAlign;
  }

  for (const [key, prop] of SPACING) {
    const value = pxNonZero(computed[prop]);
    if (value !== null) {
      style[key] = value;
    }
  }

  if (computed.display === "flex") {
    style.display = "flex";

    const direction = computed["flex-direction"];
    if (direction && direction !== "row") {
      style.flexDirection = direction;
    }

    const justify = computed["justify-content"];
    if (justify && justify !== "normal" && justify !== "flex-start") {
      style.justifyContent = justify;
    }

    const align = computed["align-items"];
    if (align && align !== "normal" && align !== "stretch") {
      style.alignItems = align;
    }

    const gap = pxNonZero(computed.gap);
    if (gap !== null) {
      style.gap = gap;
    }
  }

  const borderRadius = pxNonZero(computed["border-radius"]);
  if (borderRadius !== null) {
    style.borderRadius = borderRadius;
  }

  applyBorders(computed, style);

  return style;
}

const BORDER_SIDES = ["top", "right", "bottom", "left"] as const;

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function applyBorders(computed: Record<string, string>, style: ReactPdfStyle): void {
  const sides = BORDER_SIDES.map((side) => {
    const width = pxNonZero(computed[`border-${side}-width`]);
    const borderStyle = computed[`border-${side}-style`];
    const color = colorToHex(computed[`border-${side}-color`]);
    const active = width !== null && borderStyle !== undefined && borderStyle !== "none";
    return { side, width, color, active };
  }).filter((side): side is typeof side & { width: number } => side.active);

  if (sides.length === 0) {
    return;
  }

  const first = sides[0];
  const uniform =
    sides.length === 4 &&
    first !== undefined &&
    sides.every((side) => side.width === first.width && side.color === first.color);

  if (uniform && first) {
    style.borderWidth = first.width;
    if (first.color) {
      style.borderColor = first.color;
    }
    return;
  }

  for (const side of sides) {
    style[`border${capitalize(side.side)}Width`] = side.width;
    if (side.color) {
      style[`border${capitalize(side.side)}Color`] = side.color;
    }
  }
}

function computeTranslated(node: CapturedElement): {
  translated: ReactPdfStyle;
  inheritedNow: ReactPdfStyle;
} {
  const translated: ReactPdfStyle = {
    ...tagDefaultStyle(node.tag),
    ...translate(node.style),
  };

  const inheritedNow: ReactPdfStyle = {};
  for (const key of INHERITED) {
    const value = translated[key];
    if (value !== undefined) {
      inheritedNow[key] = value;
    }
  }

  return { translated, inheritedNow };
}

export function capturedToIr(
  node: CapturedNode,
  parentInherited: ReactPdfStyle = {},
): IrNode | null {
  if (node.type === "text") {
    return { type: "text", value: node.value };
  }

  const { translated, inheritedNow } = computeTranslated(node);

  const style: ReactPdfStyle = {};
  for (const [key, value] of Object.entries(translated)) {
    if (INHERITED.has(key) && parentInherited[key] === value) {
      continue;
    }

    style[key] = value;
  }

  const childInherited: ReactPdfStyle = { ...parentInherited, ...inheritedNow };
  const children: IrNode[] = [];
  for (const child of node.children) {
    const mapped = capturedToIr(child, childInherited);
    if (mapped) {
      children.push(mapped);
    }
  }

  const element: IrNode = {
    type: "element",
    component: tagToComponent(node.tag),
    style,
    children:
      node.tag === "ul" || node.tag === "ol"
        ? applyListMarkers(children, node.tag === "ol")
        : children,
  };

  if (node.tag === "img" && node.src) {
    element.src = node.src;
  }

  return element;
}

export function capturedToFaithful(node: CapturedNode): IrNode[] {
  const out: IrNode[] = [];

  const visit = (current: CapturedNode, inherited: ReactPdfStyle): void => {
    if (current.type !== "element") {
      return;
    }

    const { translated, inheritedNow } = computeTranslated(current);
    const resolved: ReactPdfStyle = { ...inherited, ...inheritedNow };

    if (current.tag === "img" && current.src) {
      out.push({
        type: "element",
        component: "Image",
        src: current.src,
        style: {
          position: "absolute",
          left: Math.round(current.rect.x),
          top: Math.round(current.rect.y),
          width: Math.round(current.rect.width),
          height: Math.round(current.rect.height),
        },
        children: [],
      });
      return;
    }

    const directText = current.children
      .filter((child): child is CapturedTextNode => child.type === "text")
      .map((child) => child.value)
      .join(" ")
      .trim();

    if (directText) {
      const boxStyle: ReactPdfStyle = {};
      for (const [key, value] of Object.entries(translated)) {
        if (!INHERITED.has(key)) {
          boxStyle[key] = value;
        }
      }

      out.push({
        type: "element",
        component: "Text",
        style: {
          position: "absolute",
          left: Math.round(current.rect.x),
          top: Math.round(current.rect.y),
          width: Math.round(current.rect.width),
          ...resolved,
          ...boxStyle,
        },
        children: [{ type: "text", value: directText }],
      });
    }

    for (const child of current.children) {
      if (child.type === "element") {
        visit(child, resolved);
      }
    }
  };

  visit(node, {});
  return out;
}
