import type { Block, BlockType } from './builder.types.ts'

let counter = 0

export function nextId(): string {
  counter += 1
  return `b${counter}`
}

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

export const BLOCK_TYPES: BlockType[] = ['Section', 'Heading', 'Field', 'Text', 'Table']
