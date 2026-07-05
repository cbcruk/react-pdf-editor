import { useState } from 'react'
import type { FieldEditorProps } from './field-editor.types.ts'
import { emptyLike, getFieldKind } from './props-panel.utils.ts'

export function FieldEditor({ name, value, onChange }: FieldEditorProps): React.ReactElement {
  const kind = getFieldKind(value)

  return (
    <div style={styles.field}>
      <span style={styles.label}>{name}</span>
      {kind === 'string' ? (
        <input
          style={styles.input}
          type="text"
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : kind === 'number' ? (
        <input
          style={styles.input}
          type="number"
          value={Number(value)}
          onChange={(event) => {
            const next = Number(event.target.value)
            if (!Number.isNaN(next)) {
              onChange(next)
            }
          }}
        />
      ) : kind === 'boolean' ? (
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
        />
      ) : kind === 'array' ? (
        <ArrayEditor value={value as unknown[]} onChange={onChange} />
      ) : (
        <JsonField value={value} onChange={onChange} />
      )}
    </div>
  )
}

function ArrayEditor({
  value,
  onChange,
}: {
  value: unknown[]
  onChange: (next: unknown) => void
}): React.ReactElement {
  const updateItem = (index: number, next: unknown): void => {
    onChange(value.map((item, current) => (current === index ? next : item)))
  }

  const removeItem = (index: number): void => {
    onChange(value.filter((_, current) => current !== index))
  }

  const addItem = (): void => {
    const template = value.length > 0 ? emptyLike(value[value.length - 1]) : ''
    onChange([...value, template])
  }

  return (
    <div style={styles.array}>
      {value.map((item, index) => (
        <div key={index} style={styles.arrayRow}>
          <div style={styles.arrayItem}>
            <FieldEditor
              name={`[${index}]`}
              value={item}
              onChange={(next) => updateItem(index, next)}
            />
          </div>
          <button
            type="button"
            onClick={() => removeItem(index)}
            style={styles.removeButton}
            aria-label="remove item"
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" onClick={addItem} style={styles.addButton}>
        + 항목 추가
      </button>
    </div>
  )
}

function JsonField({
  value,
  onChange,
}: Pick<FieldEditorProps, 'value' | 'onChange'>): React.ReactElement {
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
    <>
      <textarea
        spellCheck={false}
        value={text}
        onChange={(event) => handleChange(event.target.value)}
        style={{ ...styles.input, ...styles.json, ...(error ? styles.invalid : null) }}
      />
      {error ? <span style={styles.error}>{error}</span> : null}
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  label: {
    fontSize: 11,
    color: '#6b7280',
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
  json: {
    minHeight: 96,
    resize: 'vertical',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    lineHeight: 1.5,
  },
  invalid: {
    borderColor: '#ef4444',
  },
  error: {
    fontSize: 11,
    color: '#ef4444',
  },
  array: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    paddingLeft: 8,
    borderLeft: '2px solid #f3f4f6',
  },
  arrayRow: {
    display: 'flex',
    gap: 6,
    alignItems: 'flex-start',
  },
  arrayItem: {
    flex: 1,
    minWidth: 0,
  },
  removeButton: {
    appearance: 'none',
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 1,
    width: 24,
    height: 24,
    borderRadius: 6,
    cursor: 'pointer',
    flexShrink: 0,
  },
  addButton: {
    appearance: 'none',
    border: '1px dashed #d1d5db',
    background: 'none',
    color: '#6b7280',
    fontSize: 11,
    padding: '4px 8px',
    borderRadius: 6,
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
}
