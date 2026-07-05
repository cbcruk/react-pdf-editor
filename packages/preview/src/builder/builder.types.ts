export type BlockType = 'Section' | 'Heading' | 'Field' | 'Text' | 'Table'

export interface TableColumnSpec {
  key: string
  header: string
}

export type Block = { id: string; children: Block[] } & (
  | { type: 'Section'; props: { title: string } }
  | { type: 'Heading'; props: { level: 1 | 2 | 3; text: string } }
  | { type: 'Field'; props: { label: string; value: string } }
  | { type: 'Text'; props: { text: string } }
  | {
      type: 'Table'
      props: { columns: TableColumnSpec[]; data: Record<string, string>[] }
    }
)
