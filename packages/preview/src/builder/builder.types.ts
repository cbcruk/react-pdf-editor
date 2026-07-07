import type { Style } from '@react-pdf/types'

export type BlockType = 'Section' | 'Heading' | 'Field' | 'Text' | 'Table'

export interface TableColumnSpec {
  key: string
  header: string
}

// 빌더가 편집을 허용하는 레이아웃 속성만 추린 부분집합.
// packages/migrator/src/css.utils.ts 의 SUPPORTED 와 의도적으로 동일 어휘.
export type BlockStyle = Pick<
  Style,
  | 'flexDirection'
  | 'justifyContent'
  | 'alignItems'
  | 'gap'
  | 'flexGrow'
  | 'flexShrink'
  | 'flexBasis'
  | 'width'
  | 'height'
  | 'padding'
  | 'paddingTop'
  | 'paddingRight'
  | 'paddingBottom'
  | 'paddingLeft'
  | 'margin'
  | 'marginTop'
  | 'marginRight'
  | 'marginBottom'
  | 'marginLeft'
  | 'backgroundColor'
  | 'borderWidth'
  | 'borderColor'
  | 'borderRadius'
  | 'textAlign'
>

export type Block = { id: string; children: Block[]; style?: BlockStyle } & (
  | { type: 'Section'; props: { title: string } }
  | { type: 'Heading'; props: { level: 1 | 2 | 3; text: string } }
  | { type: 'Field'; props: { label: string; value: string } }
  | { type: 'Text'; props: { text: string } }
  | {
      type: 'Table'
      props: { columns: TableColumnSpec[]; data: Record<string, string>[] }
    }
)
