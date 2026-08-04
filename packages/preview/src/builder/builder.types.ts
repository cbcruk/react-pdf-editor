import type { Style } from '@react-pdf/types'

/** 빌더가 다루는 블록 종류. `Section` 만 자식을 가질 수 있는 컨테이너다. */
export type BlockType = 'Section' | 'Heading' | 'Field' | 'Text' | 'Table'

/** Table 블록의 열 정의. `key` 는 각 데이터 행에서 값을 찾는 키, `header` 는 표시 라벨. */
export interface TableColumnSpec {
  key: string
  header: string
}

/**
 * 빌더가 편집을 허용하는 레이아웃 속성만 추린 react-pdf `Style` 부분집합.
 * `packages/migrator/src/css.utils.ts` 의 `SUPPORTED` 와 의도적으로 동일 어휘라,
 * props 패널 컨트롤과 방출 결과가 migrator 가 이미 검증한 flex 속성으로 수렴한다.
 */
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

/**
 * 빌더 문서의 노드. 공통 필드(`id`·`children`·옵션 `style`)에 타입별 콘텐츠 `props`
 * 가 판별 유니언으로 결합된다. `children` 은 `Section` 에서만 채워지고, `style` 은
 * 레이아웃(배치)을 콘텐츠 `props`(의미)와 분리해 담는다.
 */
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
