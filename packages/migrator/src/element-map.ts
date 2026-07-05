import type { IrComponent, IrNode, ReactPdfStyle } from './migrator.types.ts'

const TEXT_TAGS = new Set([
  'p',
  'span',
  'a',
  'label',
  'strong',
  'em',
  'b',
  'i',
  'small',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'td',
  'th',
  'li',
  'figcaption',
  'blockquote',
])

export function tagToComponent(tag: string): IrComponent {
  if (tag === 'img') {
    return 'Image'
  }

  return TEXT_TAGS.has(tag) ? 'Text' : 'View'
}

export function applyListMarkers(children: IrNode[], ordered: boolean): IrNode[] {
  let index = 0

  return children.map((child) => {
    if (child.type !== 'element' || child.component !== 'Text') {
      return child
    }

    index += 1
    const marker = ordered ? `${index}. ` : '• '

    return {
      ...child,
      children: [{ type: 'text', value: marker }, ...child.children],
    }
  })
}

export function tagDefaultStyle(tag: string): ReactPdfStyle {
  switch (tag) {
    case 'h1':
      return { fontSize: 24, fontWeight: 700, marginBottom: 8 }
    case 'h2':
      return { fontSize: 20, fontWeight: 700, marginBottom: 6 }
    case 'h3':
      return { fontSize: 16, fontWeight: 700, marginBottom: 4 }
    case 'h4':
    case 'h5':
    case 'h6':
      return { fontWeight: 700 }
    case 'strong':
    case 'b':
      return { fontWeight: 700 }
    case 'em':
    case 'i':
      return { fontStyle: 'italic' }
    case 'p':
      return { marginBottom: 8 }
    case 'tr':
      return { flexDirection: 'row' }
    case 'td':
      return { flex: 1, paddingRight: 8 }
    case 'th':
      return { flex: 1, paddingRight: 8, fontWeight: 700 }
    default:
      return {}
  }
}
