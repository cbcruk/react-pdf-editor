import type { IrComponent, IrNode, ReactPdfStyle, RequiredFont } from './migrator.types.ts'

function styleToSource(style: ReactPdfStyle): string {
  const entries = Object.entries(style)

  if (entries.length === 0) {
    return ''
  }

  const inner = entries
    .map(([key, value]) =>
      typeof value === 'number' ? `${key}: ${value}` : `${key}: ${JSON.stringify(value)}`,
    )
    .join(', ')

  return ` style={{ ${inner} }}`
}

function textToSource(value: string): string {
  return /[<>{}]/.test(value) ? `{${JSON.stringify(value)}}` : value
}

function usesImage(nodes: IrNode[]): boolean {
  return nodes.some(
    (node) => node.type === 'element' && (node.component === 'Image' || usesImage(node.children)),
  )
}

export function emit(node: IrNode, indent: string, parent: IrComponent): string {
  if (node.type === 'text') {
    return parent === 'Text'
      ? `${indent}${textToSource(node.value)}`
      : `${indent}<Text>${textToSource(node.value)}</Text>`
  }

  if (node.component === 'Image') {
    const src = node.src ?? ''
    return `${indent}<Image src=${JSON.stringify(src)}${styleToSource(node.style)} />`
  }

  const open = `<${node.component}${styleToSource(node.style)}`

  if (node.children.length === 0) {
    return `${indent}${open} />`
  }

  const children = node.children
    .map((child) => emit(child, `${indent}  `, node.component))
    .join('\n')

  return `${indent}${open}>\n${children}\n${indent}</${node.component}>`
}

export function emitModule(
  nodes: IrNode[],
  componentName: string,
  requiredFonts: RequiredFont[] = [],
  pageStyle: ReactPdfStyle = { padding: 24 },
): string {
  const body = nodes.map((node) => emit(node, '        ', 'View')).join('\n')

  const fonts =
    requiredFonts.length > 0
      ? `\nexport const requiredFonts = ${JSON.stringify(requiredFonts, null, 2)};\n`
      : ''

  const imports = usesImage(nodes)
    ? 'Document, Image, Page, Text, View'
    : 'Document, Page, Text, View'

  return `import { ${imports} } from "@react-pdf/renderer";

export function ${componentName}(): React.ReactElement {
  return (
    <Document>
      <Page size="A4"${styleToSource(pageStyle)}>
${body}
      </Page>
    </Document>
  );
}

export default ${componentName};
${fonts}`
}
