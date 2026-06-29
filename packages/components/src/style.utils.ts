import type { Style } from "@react-pdf/types";

export function mergeStyles(...styles: Array<Style | Style[] | undefined>): Style[] {
  return styles.flatMap((style) => (style ? (Array.isArray(style) ? style : [style]) : []));
}
