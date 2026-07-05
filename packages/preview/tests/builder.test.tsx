import { registerFonts, renderPdf } from '@pkg/render'
import { expect, test } from 'vite-plus/test'
import { emitBlocks } from '../src/builder/block-emit.ts'
import { BuilderDocument } from '../src/builder/block-render.tsx'
import type { Block } from '../src/builder/builder.types.ts'
import { addBlock, moveBlock, removeBlock, updateBlockProps } from '../src/builder/builder.utils.ts'

registerFonts()

const doc: Block[] = [
  {
    id: 'h1',
    type: 'Heading',
    props: { level: 1, text: '동의서' },
    children: [],
  },
  {
    id: 's1',
    type: 'Section',
    props: { title: '환자 정보' },
    children: [
      {
        id: 'f1',
        type: 'Field',
        props: { label: '성명', value: '홍길동' },
        children: [],
      },
    ],
  },
]

test('emits kit TSX with the right imports and default export', () => {
  const tsx = emitBlocks(doc, 'Consent')

  expect(tsx).toContain('import { Field, Heading, Section } from "@pkg/components"')
  expect(tsx).toContain('export function Consent')
  expect(tsx).toContain('export default Consent')
  expect(tsx).toMatchSnapshot()
})

test('renders the block tree to a valid PDF', async () => {
  const buffer = await renderPdf(<BuilderDocument blocks={doc} />)
  const raw = buffer.toString('latin1')

  expect(raw.startsWith('%PDF-')).toBe(true)
  expect(raw).toContain('Pretendard')
})

test('tree operations add, nest, move, update and remove blocks', () => {
  const field: Block = {
    id: 'f2',
    type: 'Field',
    props: { label: '시술명', value: '위내시경' },
    children: [],
  }

  const added = addBlock(doc, 's1', field)
  expect(added[1]?.children).toHaveLength(2)

  const updated = updateBlockProps(added, 'f2', { value: 'MRI' })
  const section = updated[1]
  const nested = section?.type === 'Section' ? section.children[1] : undefined
  expect(nested?.type === 'Field' ? nested.props.value : null).toBe('MRI')

  const moved = moveBlock(updated, 's1', 'up')
  expect(moved[0]?.id).toBe('s1')

  const removed = removeBlock(added, 'f1')
  expect(removed[1]?.children).toHaveLength(1)
})
