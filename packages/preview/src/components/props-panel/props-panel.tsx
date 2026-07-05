import { useState } from 'react'
import { FieldEditor } from './field-editor.tsx'
import type { PropsPanelProps } from './props-panel.types.ts'

type Mode = 'form' | 'json'

export function PropsPanel({ value, onChange }: PropsPanelProps): React.ReactElement {
  const [mode, setMode] = useState<Mode>('form')
  const [text, setText] = useState(() => JSON.stringify(value, null, 2))
  const [error, setError] = useState<string | null>(null)

  const entries = Object.entries(value)

  const handleFieldChange = (key: string, next: unknown): void => {
    onChange({ ...value, [key]: next })
  }

  const handleJsonChange = (next: string): void => {
    setText(next)

    try {
      const parsed = JSON.parse(next) as Record<string, unknown>
      setError(null)
      onChange(parsed)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Invalid JSON')
    }
  }

  const switchTo = (next: Mode): void => {
    if (next === 'json') {
      setText(JSON.stringify(value, null, 2))
      setError(null)
    }

    setMode(next)
  }

  return (
    <aside style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.heading}>Props</span>
        <div style={styles.toggle}>
          <button
            type="button"
            onClick={() => switchTo('form')}
            style={mode === 'form' ? styles.toggleActive : styles.toggleButton}
          >
            Form
          </button>
          <button
            type="button"
            onClick={() => switchTo('json')}
            style={mode === 'json' ? styles.toggleActive : styles.toggleButton}
          >
            JSON
          </button>
        </div>
      </div>

      {mode === 'form' ? (
        entries.length === 0 ? (
          <div style={styles.empty}>No props</div>
        ) : (
          <div style={styles.fields}>
            {entries.map(([key, fieldValue]) => (
              <FieldEditor
                key={key}
                name={key}
                value={fieldValue}
                onChange={(next) => handleFieldChange(key, next)}
              />
            ))}
          </div>
        )
      ) : (
        <>
          <textarea
            spellCheck={false}
            value={text}
            onChange={(event) => handleJsonChange(event.target.value)}
            style={{
              ...styles.textarea,
              ...(error ? styles.textareaError : null),
            }}
          />
          {error ? <div style={styles.error}>{error}</div> : null}
        </>
      )}
    </aside>
  )
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    width: 280,
    flexShrink: 0,
    borderLeft: '1px solid #e5e7eb',
    padding: 16,
    boxSizing: 'border-box',
    background: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heading: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#6b7280',
  },
  toggle: {
    display: 'flex',
    gap: 2,
    background: '#f3f4f6',
    borderRadius: 6,
    padding: 2,
  },
  toggleButton: {
    appearance: 'none',
    border: 'none',
    background: 'none',
    fontSize: 11,
    padding: '3px 8px',
    borderRadius: 4,
    color: '#6b7280',
    cursor: 'pointer',
  },
  toggleActive: {
    appearance: 'none',
    border: 'none',
    background: '#ffffff',
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 4,
    color: '#111827',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
  },
  fields: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    overflowY: 'auto',
  },
  empty: {
    fontSize: 12,
    color: '#9ca3af',
  },
  textarea: {
    flex: 1,
    resize: 'none',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    padding: 10,
    fontSize: 12,
    lineHeight: 1.5,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    color: '#111827',
    outline: 'none',
  },
  textareaError: {
    borderColor: '#ef4444',
  },
  error: {
    marginTop: 8,
    fontSize: 11,
    color: '#ef4444',
  },
}
