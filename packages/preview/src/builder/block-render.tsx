import type { ReactNode } from 'react'
import { Document, Page, Text } from '@react-pdf/renderer'
import { Field, Heading, Section, Table } from '@pkg/components'
import type { Block } from './builder.types.ts'

function renderBlock(block: Block): ReactNode {
  switch (block.type) {
    case 'Section':
      return (
        <Section key={block.id} title={block.props.title}>
          {block.children.map(renderBlock)}
        </Section>
      )
    case 'Heading':
      return (
        <Heading key={block.id} level={block.props.level}>
          {block.props.text}
        </Heading>
      )
    case 'Field':
      return <Field key={block.id} label={block.props.label} value={block.props.value} />
    case 'Text':
      return <Text key={block.id}>{block.props.text}</Text>
    case 'Table':
      return <Table key={block.id} columns={block.props.columns} data={block.props.data} />
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
