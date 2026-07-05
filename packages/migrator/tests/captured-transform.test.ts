import { expect, test } from 'vite-plus/test'
import { capturedToFaithful, capturedToIr } from '../src/captured-transform.ts'
import type { CapturedNode, IrElementNode, IrNode } from '../src/index.ts'

function el(node: IrNode | null | undefined): IrElementNode {
  if (!node || node.type !== 'element') {
    throw new Error('expected an element node')
  }

  return node
}

const tree: CapturedNode = {
  type: 'element',
  tag: 'body',
  style: { color: 'rgb(26, 26, 26)' },
  rect: { x: 0, y: 0, width: 595, height: 400 },
  children: [
    {
      type: 'element',
      tag: 'div',
      style: {
        'padding-top': '24px',
        'padding-left': '24px',
        'padding-right': '24px',
        'padding-bottom': '24px',
      },
      rect: { x: 0, y: 0, width: 595, height: 400 },
      children: [
        {
          type: 'element',
          tag: 'h1',
          style: { 'font-size': '24px', 'font-weight': '700' },
          rect: { x: 24, y: 24, width: 200, height: 30 },
          children: [{ type: 'text', value: 'Invoice' }],
        },
        {
          type: 'element',
          tag: 'p',
          style: { color: 'rgb(107, 114, 128)', 'font-size': '11px' },
          rect: { x: 24, y: 60, width: 300, height: 16 },
          children: [{ type: 'text', value: 'June 2026' }],
        },
      ],
    },
  ],
}

test('reconstruct drops inherited props that match the parent', () => {
  const root = el(capturedToIr(tree))
  const div = el(root.children[0])
  const h1 = el(div.children[0])
  const p = el(div.children[1])

  expect(root.component).toBe('View')
  expect(h1.component).toBe('Text')
  expect(h1.style.fontSize).toBe(24)
  expect(h1.style.color).toBeUndefined()
  expect(p.style.color).toBe('#6b7280')
})

test('faithful flattens to absolutely positioned text leaves', () => {
  const nodes = capturedToFaithful(tree)
  expect(nodes).toHaveLength(2)

  const h1 = el(nodes[0])
  const p = el(nodes[1])

  expect(h1.style.position).toBe('absolute')
  expect(h1.style.left).toBe(24)
  expect(h1.style.top).toBe(24)
  expect(h1.style.fontSize).toBe(24)
  expect(h1.style.color).toBe('#1a1a1a')
  expect(h1.children[0]).toEqual({ type: 'text', value: 'Invoice' })

  expect(p.style.top).toBe(60)
  expect(p.style.color).toBe('#6b7280')
})

function boxedNode(borders: Record<string, string>): CapturedNode {
  return {
    type: 'element',
    tag: 'div',
    style: borders,
    rect: { x: 0, y: 0, width: 100, height: 50 },
    children: [{ type: 'text', value: 'x' }],
  }
}

test('captures a uniform border as borderWidth/borderColor', () => {
  const node = boxedNode({
    'border-top-width': '1px',
    'border-right-width': '1px',
    'border-bottom-width': '1px',
    'border-left-width': '1px',
    'border-top-style': 'solid',
    'border-right-style': 'solid',
    'border-bottom-style': 'solid',
    'border-left-style': 'solid',
    'border-top-color': 'rgb(204, 204, 204)',
    'border-right-color': 'rgb(204, 204, 204)',
    'border-bottom-color': 'rgb(204, 204, 204)',
    'border-left-color': 'rgb(204, 204, 204)',
  })

  const root = el(capturedToIr(node))
  expect(root.style.borderWidth).toBe(1)
  expect(root.style.borderColor).toBe('#cccccc')
  expect(root.style.borderTopWidth).toBeUndefined()
})

test('captures a single-side border per side', () => {
  const node = boxedNode({
    'border-bottom-width': '2px',
    'border-bottom-style': 'solid',
    'border-bottom-color': 'rgb(0, 0, 0)',
  })

  const root = el(capturedToIr(node))
  expect(root.style.borderBottomWidth).toBe(2)
  expect(root.style.borderBottomColor).toBe('#000000')
  expect(root.style.borderWidth).toBeUndefined()
})
