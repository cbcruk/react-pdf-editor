import { useState } from 'react'
import type { Block } from './builder.types.ts'

interface BlockPropsProps {
  block: Block
  onChange: (patch: Record<string, unknown>) => void
}

export function BlockProps({ block, onChange }: BlockPropsProps): React.ReactElement {
  switch (block.type) {
    case 'Section':
      return (
        <TextInput
          label="제목"
          value={block.props.title}
          onChange={(title) => onChange({ title })}
        />
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
