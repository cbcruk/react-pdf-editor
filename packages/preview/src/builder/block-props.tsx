import { useState } from 'react'
import type { Block, BlockStyle } from './builder.types.ts'

interface BlockPropsProps {
  block: Block
  onChange: (patch: Record<string, unknown>) => void
  onStyleChange: (patch: BlockStyle) => void
}

export function BlockProps({
  block,
  onChange,
  onStyleChange,
}: BlockPropsProps): React.ReactElement {
  switch (block.type) {
    case 'Section':
      return (
        <>
          <TextInput
            label="제목"
            value={block.props.title}
            onChange={(title) => onChange({ title })}
          />
          <LayoutControls style={block.style} onChange={onStyleChange} />
        </>
      )
    case 'Heading':
      return (
        <>
          <label style={styles.label}>
            레벨
            <select
              value={block.props.level}
              onChange={(event) => onChange({ level: Number(event.target.value) })}
              style={styles.input}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </label>
          <TextInput
            label="텍스트"
            value={block.props.text}
            onChange={(text) => onChange({ text })}
          />
        </>
      )
    case 'Field':
      return (
        <>
          <TextInput
            label="라벨"
            value={block.props.label}
            onChange={(label) => onChange({ label })}
          />
          <TextInput
            label="값"
            value={block.props.value}
            onChange={(value) => onChange({ value })}
          />
        </>
      )
    case 'Text':
      return (
        <label style={styles.label}>
          텍스트
          <textarea
            value={block.props.text}
            onChange={(event) => onChange({ text: event.target.value })}
            style={{ ...styles.input, ...styles.textarea }}
          />
        </label>
      )
    case 'Table':
      return (
        <>
          <JsonInput
            label="columns"
            value={block.props.columns}
            onChange={(columns) => onChange({ columns })}
          />
          <JsonInput
            label="data"
            value={block.props.data}
            onChange={(data) => onChange({ data })}
          />
        </>
      )
  }
}

function LayoutControls({
  style,
  onChange,
}: {
  style: BlockStyle | undefined
  onChange: (patch: BlockStyle) => void
}): React.ReactElement {
  // react-pdf/yoga 기본 방향은 column. row 로 바꾸면 자식이 가로로 나란히 놓인다.
  const direction = style?.flexDirection === 'row' ? 'row' : 'column'
  const gap = typeof style?.gap === 'number' ? style.gap : ''

  return (
    <>
      <div style={styles.sectionLabel}>레이아웃</div>
      <div style={styles.label}>
        방향
        <div style={styles.segment}>
          {(['column', 'row'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ flexDirection: value === 'column' ? undefined : 'row' })}
              style={{
                ...styles.segmentButton,
                ...(direction === value ? styles.segmentActive : null),
              }}
            >
              {value === 'column' ? '세로' : '가로'}
            </button>
          ))}
        </div>
      </div>
      <label style={styles.label}>
        간격 (gap, pt)
        <input
          type="number"
          min={0}
          value={gap}
          placeholder="0"
          onChange={(event) => {
            const next = event.target.value
            onChange({ gap: next === '' ? undefined : Number(next) })
          }}
          style={styles.input}
        />
      </label>
    </>
  )
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (next: string) => void
}): React.ReactElement {
  return (
    <label style={styles.label}>
      {label}
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={styles.input}
      />
    </label>
  )
}

function JsonInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: unknown
  onChange: (next: unknown) => void
}): React.ReactElement {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2))
  const [error, setError] = useState<string | null>(null)

  const handleChange = (next: string): void => {
    setText(next)
    try {
      onChange(JSON.parse(next))
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Invalid JSON')
    }
  }

  return (
    <label style={styles.label}>
      {label}
      <textarea
        spellCheck={false}
        value={text}
        onChange={(event) => handleChange(event.target.value)}
        style={{
          ...styles.input,
          ...styles.textarea,
          ...(error ? styles.invalid : null),
        }}
      />
      {error ? <span style={styles.error}>{error}</span> : null}
    </label>
  )
}

const styles: Record<string, React.CSSProperties> = {
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 8,
  },
  segment: {
    display: 'flex',
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    appearance: 'none',
    border: '1px solid #d1d5db',
    background: '#f9fafb',
    color: '#374151',
    fontSize: 12,
    padding: '5px 8px',
    borderRadius: 6,
    cursor: 'pointer',
  },
  segmentActive: {
    background: '#eff6ff',
    borderColor: '#2563eb',
    color: '#1d4ed8',
  },
  input: {
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    padding: '6px 8px',
    fontSize: 12,
    color: '#111827',
    outline: 'none',
    fontFamily: 'inherit',
  },
  textarea: {
    minHeight: 72,
    resize: 'vertical',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    lineHeight: 1.5,
  },
  invalid: {
    borderColor: '#ef4444',
  },
  error: {
    color: '#ef4444',
  },
}
