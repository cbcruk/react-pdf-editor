import type { Block, BlockType } from './builder.types.ts'

let counter = 0

/**
 * 세션 안에서 유일한 블록 id(`b1`, `b2`, …)를 순차 발급한다.
 * 모듈 로컬 카운터라 렌더/직렬화에 안정적이지만 리로드하면 다시 1부터 시작한다.
 *
 * @returns 새 블록에 부여할 고유 id
 */
export function nextId(): string {
  counter += 1
  return `b${counter}`
}

/**
 * 주어진 타입의 새 블록을 기본 props/빈 children 으로 만든다.
 * "블록 추가" 팔레트가 이 함수로 초기 블록을 생성한다.
 *
 * @param type - 만들 블록 타입
 * @returns 새 id 가 부여된 기본값 블록
 */
export function createBlock(type: BlockType): Block {
  const id = nextId()

  switch (type) {
    case 'Section':
      return { id, type, props: { title: '제목 없는 섹션' }, children: [] }
    case 'Heading':
      return { id, type, props: { level: 2, text: '제목' }, children: [] }
    case 'Field':
      return { id, type, props: { label: '라벨', value: '값' }, children: [] }
    case 'Text':
      return { id, type, props: { text: '본문 텍스트' }, children: [] }
    case 'Table':
      return {
        id,
        type,
        props: {
          columns: [
            { key: 'a', header: '열 1' },
            { key: 'b', header: '열 2' },
          ],
          data: [{ a: '값', b: '값' }],
        },
        children: [],
      }
  }
}

/** "블록 추가" 팔레트에 노출되는 블록 타입 목록(표시 순서 그대로). */
export const BLOCK_TYPES: BlockType[] = ['Section', 'Heading', 'Field', 'Text', 'Table']
