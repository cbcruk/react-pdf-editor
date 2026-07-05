import { createElement } from 'react'
import type { ReactNode } from 'react'
import { Document, Image, Page, Text, View, renderToBuffer } from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'
import { expect, test } from 'vite-plus/test'
import { transform } from '../src/index.ts'
import type { IrNode } from '../src/index.ts'

function toElement(node: IrNode, key: number, parent: 'View' | 'Text'): ReactNode {
  if (node.type === 'text') {
    return parent === 'Text' ? node.value : createElement(Text, { key }, node.value)
  }

  const props = { key, style: node.style as Style }

  if (node.component === 'Image') {
    return createElement(Image, { ...props, src: node.src ?? '' })
  }

  const component = node.component
  const children = node.children.map((child, index) => toElement(child, index, component))

  return component === 'View'
    ? createElement(View, props, ...children)
    : createElement(Text, props, ...children)
}

test('the migrated IR renders to a valid PDF', async () => {
  const ir = transform(`<div style="padding: 16px"><h1>Invoice</h1><p>Total 1000</p></div>`)

  const document = createElement(
    Document,
    null,
    createElement(
      Page,
      { size: 'A4', style: { padding: 24 } },
      ...ir.map((node, index) => toElement(node, index, 'View')),
    ),
  )

  const buffer = await renderToBuffer(document)

  expect(buffer.length).toBeGreaterThan(1_000)
  expect(buffer.toString('latin1').startsWith('%PDF-')).toBe(true)
})
