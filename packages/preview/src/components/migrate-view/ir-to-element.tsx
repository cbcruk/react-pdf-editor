import { createElement } from 'react'
import type { ReactNode } from 'react'
import { Document, Image, Page, Text, View } from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'
import type { IrNode } from '@pkg/migrator/browser'

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

export function MigratedDocument({ nodes }: { nodes: IrNode[] }): React.ReactElement {
  return (
    <Document>
      <Page size="A4" style={{ padding: 24, fontFamily: 'Pretendard', fontSize: 11 }}>
        {nodes.map((node, index) => toElement(node, index, 'View'))}
      </Page>
    </Document>
  )
}
