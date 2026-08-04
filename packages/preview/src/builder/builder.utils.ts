import type { Block, BlockStyle } from './builder.types.ts'

/**
 * 블록 트리를 깊이 우선으로 훑어 `id` 와 일치하는 블록을 찾는다.
 *
 * @param blocks - 최상위 블록 목록(각 블록은 `children` 로 중첩된다)
 * @param id - 찾을 블록의 고유 id
 * @returns 일치하는 블록, 없으면 `null`
 */
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

/**
 * 지정한 블록의 콘텐츠 `props` 를 얕게 병합해 갱신한 새 트리를 반환한다(불변).
 * 레이아웃 `style` 이 아니라 컴포넌트 의미값(제목·텍스트·라벨 등)을 바꾼다.
 *
 * @param blocks - 최상위 블록 목록
 * @param id - 갱신할 블록의 id
 * @param patch - 기존 props 위에 덮어쓸 부분 값
 * @returns 해당 블록의 props 만 교체된 새 블록 트리
 */
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

/**
 * 지정한 블록의 레이아웃 `style` 을 병합해 갱신한 새 트리를 반환한다(불변).
 * `patch` 에서 값이 `undefined` 인 키는 style 에서 제거하고, 결과 style 이
 * 비면 `style` 필드 자체를 떼어내 깔끔한 방출(emit)을 유지한다.
 *
 * @param blocks - 최상위 블록 목록
 * @param id - 갱신할 블록의 id
 * @param patch - 병합할 부분 스타일. 키 값이 `undefined` 면 해당 속성 제거
 * @returns 해당 블록의 style 만 갱신된 새 블록 트리
 */
export function updateBlockStyle(blocks: Block[], id: string, patch: BlockStyle): Block[] {
  return blocks.map((block) => {
    if (block.id === id) {
      const style = { ...block.style, ...patch }
      // 값이 비워진(undefined) 키는 style 에서 제거해 깔끔한 방출을 유지한다.
      for (const key of Object.keys(patch) as Array<keyof BlockStyle>) {
        if (patch[key] === undefined) {
          delete style[key]
        }
      }
      const next = { ...block, style } as Block
      if (Object.keys(style).length === 0) {
        delete next.style
      }
      return next
    }

    return { ...block, children: updateBlockStyle(block.children, id, patch) }
  })
}

/**
 * 지정한 블록을 트리 어느 깊이에서든 제거한 새 트리를 반환한다(불변).
 *
 * @param blocks - 최상위 블록 목록
 * @param id - 제거할 블록의 id
 * @returns 해당 블록(과 그 하위)이 빠진 새 블록 트리
 */
export function removeBlock(blocks: Block[], id: string): Block[] {
  return blocks
    .filter((block) => block.id !== id)
    .map((block) => ({ ...block, children: removeBlock(block.children, id) }))
}

/**
 * 새 블록을 트리에 삽입한 새 트리를 반환한다(불변).
 * `parentId` 가 `null` 이면 최상위 끝에, 아니면 해당 부모의 `children` 끝에 붙인다.
 *
 * @param blocks - 최상위 블록 목록
 * @param parentId - 부모 블록의 id. 최상위에 추가하려면 `null`
 * @param block - 삽입할 블록
 * @returns 블록이 추가된 새 블록 트리
 */
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

/**
 * 같은 부모의 형제 사이에서 블록을 한 칸 위/아래로 이동한 새 트리를 반환한다(불변).
 * 이미 목록의 처음/끝이라 이동할 수 없으면 입력 배열을 그대로 돌려준다.
 *
 * @param blocks - 최상위 블록 목록
 * @param id - 이동할 블록의 id
 * @param direction - 이동 방향(`'up'` 앞으로, `'down'` 뒤로)
 * @returns 순서가 바뀐 새 블록 트리(경계라면 변화 없음)
 */
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
