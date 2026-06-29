import { NodeType, parse } from "node-html-parser";
import type {
  HTMLElement as ParserElement,
  Node as ParserNode,
  TextNode as ParserText,
} from "node-html-parser";
import { parseInlineStyle } from "./css.utils.ts";
import { applyListMarkers, tagDefaultStyle, tagToComponent } from "./element-map.ts";
import type { IrElementNode, IrNode } from "./migrator.types.ts";

export function transform(html: string): IrNode[] {
  const root = parse(html);
  return mapChildren(root.childNodes);
}

function mapChildren(nodes: ParserNode[]): IrNode[] {
  const result: IrNode[] = [];

  for (const node of nodes) {
    if (node.nodeType === NodeType.TEXT_NODE) {
      const value = (node as ParserText).rawText.replace(/\s+/g, " ").trim();
      if (value) {
        result.push({ type: "text", value });
      }
    } else if (node.nodeType === NodeType.ELEMENT_NODE) {
      result.push(mapElement(node as ParserElement));
    }
  }

  return result;
}

function mapElement(element: ParserElement): IrElementNode {
  const tag = (element.rawTagName || "div").toLowerCase();

  const children = mapChildren(element.childNodes);

  const node: IrElementNode = {
    type: "element",
    component: tagToComponent(tag),
    style: {
      ...tagDefaultStyle(tag),
      ...parseInlineStyle(element.getAttribute("style")),
    },
    children: tag === "ul" || tag === "ol" ? applyListMarkers(children, tag === "ol") : children,
  };

  if (tag === "img") {
    node.src = element.getAttribute("src") ?? "";
  }

  return node;
}
