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

/**
 * 블록 트리를 실제 react-pdf TSX 모듈 문자열로 방출한다.
 *
 * 사용된 블록 타입만 골라 `@pkg/components` / `@react-pdf/renderer` import 를 만들고,
 * style 이 붙은 블록이 하나라도 있으면 `View` import 를 추가한다. Section 의 style 은
 * 자식을 감싸는 `<View>` 로, 리프의 style 은 자기 자신을 감싸는 `<View>` 로 직렬화된다.
 *
 * @param blocks - 최상위 블록 목록
 * @param componentName - 내보낼 함수 컴포넌트 이름(named + default export)
 * @returns 저장하거나 `pdf/` 에 기록할 수 있는 완성된 TSX 소스 문자열
 */
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
