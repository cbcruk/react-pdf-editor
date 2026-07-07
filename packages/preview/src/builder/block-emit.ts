import type { Block, BlockType } from './builder.types.ts'

const KIT_TYPES = new Set<BlockType>(['Section', 'Heading', 'Field', 'Table'])

function jsxText(value: string): string {
  return /[<>{}]/.test(value) ? `{${JSON.stringify(value)}}` : value
}

function strAttr(name: string, value: string): string {
  return /["\\{}<>]/.test(value) ? `${name}={${JSON.stringify(value)}}` : `${name}="${value}"`
}

function collectTypes(blocks: Block[], seen: Set<BlockType>): void {
  for (const block of blocks) {
    seen.add(block.type)
    collectTypes(block.children, seen)
  }
}

function hasStyle(block: Block): boolean {
  return block.style !== undefined && Object.keys(block.style).length > 0
}

function usesView(blocks: Block[]): boolean {
  return blocks.some((block) => hasStyle(block) || usesView(block.children))
}

function emitLeaf(block: Block, indent: string): string {
  switch (block.type) {
    case 'Heading':
      return `${indent}<Heading level={${block.props.level}}>${jsxText(block.props.text)}</Heading>`
    case 'Field':
      return `${indent}<Field ${strAttr('label', block.props.label)} ${strAttr('value', block.props.value)} />`
    case 'Text':
      return `${indent}<Text>${jsxText(block.props.text)}</Text>`
    case 'Table':
      return `${indent}<Table\n${indent}  columns={${JSON.stringify(block.props.columns)}}\n${indent}  data={${JSON.stringify(block.props.data)}}\n${indent}/>`
    case 'Section':
      return ''
  }
}

function emitBlock(block: Block, indent: string): string {
  if (block.type === 'Section') {
    const open = `${indent}<Section ${strAttr('title', block.props.title)}>`
    const childIndent = hasStyle(block) ? `${indent}    ` : `${indent}  `
    const children = block.children.map((child) => emitBlock(child, childIndent)).join('\n')
    const body = hasStyle(block)
      ? `${indent}  <View style={${JSON.stringify(block.style)}}>\n${children}\n${indent}  </View>`
      : children
    return `${open}\n${body}\n${indent}</Section>`
  }

  if (!hasStyle(block)) {
    return emitLeaf(block, indent)
  }

  const element = emitLeaf(block, `${indent}  `)
  return `${indent}<View style={${JSON.stringify(block.style)}}>\n${element}\n${indent}</View>`
}

export function emitBlocks(blocks: Block[], componentName: string): string {
  const seen = new Set<BlockType>()
  collectTypes(blocks, seen)

  const kit = [...KIT_TYPES].filter((type) => seen.has(type)).sort()
  const rpf = [
    'Document',
    'Page',
    ...(seen.has('Text') ? ['Text'] : []),
    ...(usesView(blocks) ? ['View'] : []),
  ]

  const kitImport = kit.length > 0 ? `import { ${kit.join(', ')} } from "@pkg/components";\n` : ''

  const body = blocks.map((block) => emitBlock(block, '        ')).join('\n')

  return `import { ${rpf.join(', ')} } from "@react-pdf/renderer";
${kitImport}
export function ${componentName}(): React.ReactElement {
  return (
    <Document>
      <Page size="A4" style={{ padding: 48, fontFamily: "Pretendard", fontSize: 11 }}>
${body}
      </Page>
    </Document>
  );
}

export default ${componentName};
`
}
