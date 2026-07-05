import { useMemo, useState } from 'react'
import { PdfPreview } from '../components/pdf-preview/pdf-preview.tsx'
import { BLOCK_TYPES, createBlock, nextId } from './block-defaults.ts'
import { emitBlocks } from './block-emit.ts'
import { BlockProps } from './block-props.tsx'
import { BuilderDocument } from './block-render.tsx'
import type { Block } from './builder.types.ts'
import { addBlock, findBlock, moveBlock, removeBlock, updateBlockProps } from './builder.utils.ts'

function initialDocument(): Block[] {
  return [
    {
      id: nextId(),
      type: 'Heading',
      props: { level: 1, text: '의료행위 동의서' },
      children: [],
    },
    {
      id: nextId(),
      type: 'Section',
      props: { title: '환자 정보' },
      children: [
        {
          id: nextId(),
          type: 'Field',
          props: { label: '성명', value: '홍길동' },
          children: [],
        },
        {
          id: nextId(),
          type: 'Field',
          props: { label: '시술명', value: '위내시경 검사' },
          children: [],
        },
      ],
    },
  ]
}

function toComponentName(name: string): string {
  return (
    name
      .split(/[^a-zA-Z0-9]+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') || 'Document'
  )
}

export function BuilderView(): React.ReactElement {
  const [blocks, setBlocks] = useState<Block[]>(initialDocument)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [docName, setDocName] = useState('my-document')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [showTsx, setShowTsx] = useState(false)

  const selected = selectedId ? findBlock(blocks, selectedId) : null
  const componentName = useMemo(() => toComponentName(docName), [docName])
  const tsx = useMemo(() => emitBlocks(blocks, componentName), [blocks, componentName])
  const preview = useMemo(() => <BuilderDocument blocks={blocks} />, [blocks])

  const handleAdd = (type: (typeof BLOCK_TYPES)[number]): void => {
    const block = createBlock(type)
    const parentId = selected?.type === 'Section' ? selected.id : null
    setBlocks((prev) => addBlock(prev, parentId, block))
    setSelectedId(block.id)
  }

  const handleSave = async (): Promise<void> => {
    setSaveMessage(null)
    try {
      const response = await fetch('/api/save-doc', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: docName, tsx }),
      })
      const data = (await response.json()) as { path?: string; error?: string }
      if (!response.ok || data.error) {
        throw new Error(data.error ?? 'Save failed')
      }
      setSaveMessage(`Saved ${data.path} — 사이드바에서 열립니다`)
    } catch (cause) {
      setSaveMessage(cause instanceof Error ? cause.message : String(cause))
    }
  }

  return (
    <div style={styles.shell}>
      <div style={styles.left}>
        <div style={styles.label}>블록 추가</div>
        <div style={styles.palette}>
          {BLOCK_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleAdd(type)}
              style={styles.paletteButton}
            >
              + {type}
            </button>
          ))}
        </div>
        <div style={styles.hint}>
          {selected?.type === 'Section' ? `선택한 Section 안에 추가됩니다` : `문서 끝에 추가됩니다`}
        </div>

        <div style={styles.label}>문서 트리</div>
        <div style={styles.tree}>
          {blocks.length === 0 ? (
            <div style={styles.empty}>블록을 추가하세요</div>
          ) : (
            <BlockRows
              blocks={blocks}
              depth={0}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onMove={(id, dir) => setBlocks((prev) => moveBlock(prev, id, dir))}
              onRemove={(id) => {
                setBlocks((prev) => removeBlock(prev, id))
                if (id === selectedId) {
                  setSelectedId(null)
                }
              }}
            />
          )}
        </div>
      </div>

      <PdfPreview document={preview} />

      <div style={styles.right}>
        <div style={styles.label}>속성{selected ? ` · ${selected.type}` : ''}</div>
        {selected ? (
          <BlockProps
            key={selected.id}
            block={selected}
            onChange={(patch) => setBlocks((prev) => updateBlockProps(prev, selected.id, patch))}
          />
        ) : (
          <div style={styles.empty}>블록을 선택하세요</div>
        )}

        <div style={styles.divider} />

        <div style={styles.label}>내보내기</div>
        <input
          value={docName}
          onChange={(event) => setDocName(event.target.value)}
          style={styles.nameInput}
        />
        <div style={styles.exportRow}>
          <button type="button" onClick={() => void handleSave()} style={styles.saveButton}>
            pdf/에 저장
          </button>
          <button
            type="button"
            onClick={() => setShowTsx((prev) => !prev)}
            style={styles.tsxButton}
          >
            {showTsx ? 'TSX 숨기기' : 'TSX 보기'}
          </button>
        </div>
        {saveMessage ? <div style={styles.saveMessage}>{saveMessage}</div> : null}
        {showTsx ? <pre style={styles.code}>{tsx}</pre> : null}
      </div>
    </div>
  )
}

interface BlockRowsProps {
  blocks: Block[]
  depth: number
  selectedId: string | null
  onSelect: (id: string) => void
  onMove: (id: string, direction: 'up' | 'down') => void
  onRemove: (id: string) => void
}

function BlockRows({
  blocks,
  depth,
  selectedId,
  onSelect,
  onMove,
  onRemove,
}: BlockRowsProps): React.ReactElement {
  return (
    <>
      {blocks.map((block) => (
        <div key={block.id}>
          <div
            style={{
              ...styles.row,
              paddingLeft: 8 + depth * 14,
              ...(block.id === selectedId ? styles.rowActive : null),
            }}
          >
            <button type="button" onClick={() => onSelect(block.id)} style={styles.rowLabel}>
              {block.type}
              <span style={styles.rowMeta}>{blockSummary(block)}</span>
            </button>
            <button type="button" onClick={() => onMove(block.id, 'up')} style={styles.iconButton}>
              ↑
            </button>
            <button
              type="button"
              onClick={() => onMove(block.id, 'down')}
              style={styles.iconButton}
            >
              ↓
            </button>
            <button type="button" onClick={() => onRemove(block.id)} style={styles.iconButton}>
              ⌦
            </button>
          </div>
          {block.children.length > 0 ? (
            <BlockRows
              blocks={block.children}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onMove={onMove}
              onRemove={onRemove}
            />
          ) : null}
        </div>
      ))}
    </>
  )
}

function blockSummary(block: Block): string {
  switch (block.type) {
    case 'Section':
      return block.props.title
    case 'Heading':
    case 'Text':
      return block.props.text
    case 'Field':
      return block.props.label
    case 'Table':
      return `${block.props.columns.length}열`
  }
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    flex: 1,
    display: 'flex',
    minWidth: 0,
  },
  left: {
    width: 260,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: 16,
    boxSizing: 'border-box',
    borderRight: '1px solid #e5e7eb',
    background: '#ffffff',
    overflowY: 'auto',
  },
  right: {
    width: 300,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: 16,
    boxSizing: 'border-box',
    borderLeft: '1px solid #e5e7eb',
    background: '#ffffff',
    overflowY: 'auto',
  },
  preview: {
    flex: 1,
    minWidth: 0,
    background: '#525659',
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#6b7280',
  },
  palette: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  paletteButton: {
    appearance: 'none',
    border: '1px solid #d1d5db',
    background: '#f9fafb',
    color: '#374151',
    fontSize: 12,
    padding: '5px 8px',
    borderRadius: 6,
    cursor: 'pointer',
  },
  hint: {
    fontSize: 10,
    color: '#9ca3af',
  },
  tree: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    paddingRight: 4,
    borderRadius: 6,
  },
  rowActive: {
    background: '#eff6ff',
  },
  rowLabel: {
    flex: 1,
    minWidth: 0,
    appearance: 'none',
    border: 'none',
    background: 'none',
    textAlign: 'left',
    fontSize: 12,
    color: '#111827',
    cursor: 'pointer',
    padding: '6px 4px',
    display: 'flex',
    flexDirection: 'column',
  },
  rowMeta: {
    fontSize: 10,
    color: '#9ca3af',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  iconButton: {
    appearance: 'none',
    border: 'none',
    background: 'none',
    color: '#9ca3af',
    fontSize: 12,
    cursor: 'pointer',
    padding: '2px 4px',
  },
  divider: {
    height: 1,
    background: '#e5e7eb',
    margin: '8px 0',
  },
  nameInput: {
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    padding: '6px 8px',
    fontSize: 12,
    color: '#111827',
    outline: 'none',
  },
  exportRow: {
    display: 'flex',
    gap: 6,
  },
  saveButton: {
    flex: 1,
    appearance: 'none',
    border: 'none',
    background: '#2563eb',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 600,
    padding: '7px 10px',
    borderRadius: 6,
    cursor: 'pointer',
  },
  tsxButton: {
    appearance: 'none',
    border: '1px solid #d1d5db',
    background: '#ffffff',
    color: '#374151',
    fontSize: 12,
    padding: '7px 10px',
    borderRadius: 6,
    cursor: 'pointer',
  },
  saveMessage: {
    fontSize: 11,
    color: '#059669',
  },
  code: {
    margin: 0,
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    padding: 10,
    fontSize: 10,
    lineHeight: 1.5,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    color: '#111827',
    background: '#f9fafb',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
  },
  empty: {
    fontSize: 11,
    color: '#9ca3af',
    padding: '4px 0',
  },
}
