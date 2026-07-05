import type { Block } from './builder.types.ts'

export function findBlock(blocks: Block[], id: string): Block | null {
  for (const block of blocks) {
    if (block.id === id) {
      return block
    }

    const nested = findBlock(block.children, id)
    if (nested) {
      return nested
    }
  }

  return null
}

export function updateBlockProps(
  blocks: Block[],
  id: string,
  patch: Record<string, unknown>,
): Block[] {
  return blocks.map((block) => {
    if (block.id === id) {
      return { ...block, props: { ...block.props, ...patch } } as Block
    }

    return { ...block, children: updateBlockProps(block.children, id, patch) }
  })
}

export function removeBlock(blocks: Block[], id: string): Block[] {
  return blocks
    .filter((block) => block.id !== id)
    .map((block) => ({ ...block, children: removeBlock(block.children, id) }))
}

export function addBlock(blocks: Block[], parentId: string | null, block: Block): Block[] {
  if (parentId === null) {
    return [...blocks, block]
  }

  return blocks.map((current) =>
    current.id === parentId
      ? ({ ...current, children: [...current.children, block] } as Block)
      : { ...current, children: addBlock(current.children, parentId, block) },
  )
}

export function moveBlock(blocks: Block[], id: string, direction: 'up' | 'down'): Block[] {
  const index = blocks.findIndex((block) => block.id === id)

  if (index !== -1) {
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= blocks.length) {
      return blocks
    }

    const next = [...blocks]
    const moved = next[index]
    const swapped = next[target]
    if (moved && swapped) {
      next[index] = swapped
      next[target] = moved
    }
    return next
  }

  return blocks.map((block) => ({
    ...block,
    children: moveBlock(block.children, id, direction),
  }))
}
