import type { ReactNode } from 'react'
import { Document, Page, Text, View } from '@react-pdf/renderer'
import { Field, Heading, Section, Table } from '@pkg/components'
import type { Block } from './builder.types.ts'

// 리프 블록의 style 은 자기 박스에 적용(단일 자식 래핑).
function withBox(block: Block, node: ReactNode): ReactNode {
  if (!block.style) {
    return node
  }

  return (
    <View key={block.id} style={block.style}>
      {node}
    </View>
  )
}

function renderBlock(block: Block): ReactNode {
  switch (block.type) {
    case 'Section': {
      const children = block.children.map(renderBlock)

      // Section 의 style 은 제목이 아니라 자식 흐름(row/gap 등)을 제어한다.
      return (
        <Section key={block.id} title={block.props.title}>
          {block.style ? <View style={block.style}>{children}</View> : children}
        </Section>
      )
    }
    case 'Heading':
      return withBox(
        block,
        <Heading key={block.id} level={block.props.level}>
          {block.props.text}
        </Heading>,
      )
    case 'Field':
      return withBox(
        block,
        <Field key={block.id} label={block.props.label} value={block.props.value} />,
      )
    case 'Text':
      return withBox(block, <Text key={block.id}>{block.props.text}</Text>)
    case 'Table':
      return withBox(
        block,
        <Table key={block.id} columns={block.props.columns} data={block.props.data} />,
      )
  }
}

export function BuilderDocument({ blocks }: { blocks: Block[] }): React.ReactElement {
  return (
    <Document>
      <Page size="A4" style={{ padding: 48, fontFamily: 'Pretendard', fontSize: 11 }}>
        {blocks.map(renderBlock)}
      </Page>
    </Document>
  )
}
