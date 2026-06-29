import { chromium } from "playwright-core";
import type { CaptureOptions, CaptureSource, CapturedNode } from "./migrator.types.ts";

const STYLE_PROPS = [
  "color",
  "background-color",
  "font-size",
  "font-weight",
  "font-style",
  "font-family",
  "text-align",
  "letter-spacing",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "display",
  "flex-direction",
  "justify-content",
  "align-items",
  "gap",
  "border-radius",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-top-style",
  "border-right-style",
  "border-bottom-style",
  "border-left-style",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
];

export async function capture(
  source: CaptureSource,
  options: CaptureOptions = {},
): Promise<CapturedNode | null> {
  const browser = await chromium.launch({ channel: "chrome" });

  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 794, height: 1123 });
    await page.emulateMedia({ media: options.media ?? "print" });

    if (source.url) {
      await page.goto(source.url, { waitUntil: "networkidle" });
    } else {
      await page.setContent(source.html ?? "", { waitUntil: "networkidle" });
    }

    return await page.evaluate((styleProps: string[]): CapturedNode | null => {
      function walk(node: ChildNode): CapturedNode | null {
        if (node.nodeType === 3) {
          const value = (node.textContent ?? "").replace(/\s+/g, " ").trim();
          return value ? { type: "text", value } : null;
        }

        if (node.nodeType !== 1) {
          return null;
        }

        const element = node as Element;
        const computed = getComputedStyle(element);

        if (computed.display === "none" || computed.visibility === "hidden") {
          return null;
        }

        const style: Record<string, string> = {};
        for (const prop of styleProps) {
          const value = computed.getPropertyValue(prop);
          if (value) {
            style[prop] = value;
          }
        }

        const rect = element.getBoundingClientRect();
        const children: CapturedNode[] = [];
        for (const child of element.childNodes) {
          const mapped = walk(child);
          if (mapped) {
            children.push(mapped);
          }
        }

        const tag = element.tagName.toLowerCase();
        const captured: CapturedNode = {
          type: "element",
          tag,
          style,
          rect: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          },
          children,
        };

        if (tag === "img") {
          captured.src =
            (element as HTMLImageElement).currentSrc || (element as HTMLImageElement).src;
        }

        return captured;
      }

      return walk(document.body);
    }, STYLE_PROPS);
  } finally {
    await browser.close();
  }
}
