import { parse } from "node-html-parser";
import { parseInlineStyle } from "./css.utils.ts";
import type { CapturedNode, RequiredFont } from "./migrator.types.ts";

const GENERIC_FAMILIES = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "system-ui",
  "ui-sans-serif",
  "ui-serif",
  "ui-monospace",
  "cursive",
  "fantasy",
  "-apple-system",
  "blinkmacsystemfont",
  "helvetica",
  "helvetica neue",
  "arial",
  "courier",
  "courier new",
  "times",
  "times new roman",
]);

export function firstFamily(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const first = value
    .split(",")[0]
    ?.trim()
    .replace(/^['"]|['"]$/g, "")
    .trim();

  if (!first || GENERIC_FAMILIES.has(first.toLowerCase())) {
    return null;
  }

  return first;
}

function weightOf(value: string | number | undefined): number {
  if (typeof value === "number") {
    return value;
  }

  if (!value || value === "normal") {
    return 400;
  }

  if (value === "bold") {
    return 700;
  }

  const num = Number(value);
  return Number.isNaN(num) ? 400 : num;
}

function add(map: Map<string, Set<number>>, family: string, weight: number): void {
  const weights = map.get(family) ?? new Set<number>();
  weights.add(weight);
  map.set(family, weights);
}

function finalize(map: Map<string, Set<number>>): RequiredFont[] {
  return [...map.entries()]
    .map(([family, weights]) => ({
      family,
      weights: [...weights].sort((a, b) => a - b),
    }))
    .sort((a, b) => a.family.localeCompare(b.family));
}

export function collectFromCaptured(node: CapturedNode | null): RequiredFont[] {
  const map = new Map<string, Set<number>>();

  const visit = (current: CapturedNode): void => {
    if (current.type !== "element") {
      return;
    }

    const family = firstFamily(current.style["font-family"]);
    if (family) {
      add(map, family, weightOf(current.style["font-weight"]));
    }

    current.children.forEach(visit);
  };

  if (node) {
    visit(node);
  }

  return finalize(map);
}

export function collectFromHtml(html: string): RequiredFont[] {
  const map = new Map<string, Set<number>>();

  const visit = (node: { nodeType: number }): void => {
    const element = node as {
      nodeType: number;
      getAttribute?: (key: string) => string | undefined;
      childNodes: Array<{ nodeType: number }>;
    };

    if (element.nodeType === 1 && element.getAttribute) {
      const style = parseInlineStyle(element.getAttribute("style"));
      const family = typeof style.fontFamily === "string" ? firstFamily(style.fontFamily) : null;

      if (family) {
        add(map, family, weightOf(style.fontWeight));
      }
    }

    element.childNodes.forEach(visit);
  };

  visit(parse(html));
  return finalize(map);
}
