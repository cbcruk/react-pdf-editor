import { useMemo, useState } from 'react'
import { PDFViewer } from '@react-pdf/renderer'
import { htmlToReactPdf, transform } from '@pkg/migrator/browser'
import type { IrNode } from '@pkg/migrator/browser'
import { MigratedDocument } from './ir-to-element.tsx'

const SAMPLE = `<div style="font-family: Pretendard; padding: 24px; color: #1a1a1a">
  <h1 style="font-size: 24px; margin-bottom: 8px">청구서</h1>
  <p style="color: #6b7280; font-size: 11px">2026년 6월 발행</p>
  <div style="display: flex; justify-content: space-between; margin-top: 16px">
    <span>프론트엔드 개발</span>
    <strong>4,000,000원</strong>
  </div>
</div>`

type SourceMode = 'inline' | 'capture'
type CaptureMode = 'reconstruct' | 'faithful'

interface CaptureResponse {
  tsx?: string
  nodes?: IrNode[]
  error?: string
}

interface SaveResponse {
  path?: string
  error?: string
}

export function MigrateView(): React.ReactElement {
  const [html, setHtml] = useState(SAMPLE)
  const [sourceMode, setSourceMode] = useState<SourceMode>('inline')
  const [captureMode, setCaptureMode] = useState<CaptureMode>('reconstruct')
  const [captured, setCaptured] = useState<{ tsx: string; nodes: IrNode[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [docName, setDocName] = useState('migrated')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const componentName = useMemo(
    () =>
      docName
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('') || 'Migrated',
    [docName],
  )

  const inlineIr = useMemo<IrNode[]>(() => {
    try {
      return transform(html)
    } catch {
      return []
    }
  }, [html])

  const inlineTsx = useMemo(() => {
    try {
      return htmlToReactPdf(html, { componentName })
    } catch (cause) {
      return cause instanceof Error ? cause.message : String(cause)
    }
  }, [html, componentName])

  const isCapture = sourceMode === 'capture'
  const ir = isCapture ? (captured?.nodes ?? []) : inlineIr
  const tsx = isCapture ? (captured?.tsx ?? '') : inlineTsx

  const runCapture = async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const trimmed = html.trim()
      const source = /^https?:\/\//i.test(trimmed) ? { url: trimmed } : { html }
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ source, mode: captureMode, componentName }),
      })
      const data = (await response.json()) as CaptureResponse

      if (!response.ok || data.error) {
        throw new Error(data.error ?? 'Capture failed')
      }

      setCaptured({ tsx: data.tsx ?? '', nodes: data.nodes ?? [] })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setLoading(false)
    }
  }

  const saveDoc = async (): Promise<void> => {
    setSaveMessage(null)

    try {
      const response = await fetch('/api/save-doc', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: docName, tsx }),
      })
      const data = (await response.json()) as SaveResponse

      if (!response.ok || data.error) {
        throw new Error(data.error ?? 'Save failed')
      }

      setSaveMessage(`Saved ${data.path} — check the sidebar`)
    } catch (cause) {
      setSaveMessage(cause instanceof Error ? cause.message : String(cause))
    }
  }

  return (
    <div style={styles.shell}>
      <div style={styles.left}>
        <div style={styles.toggleRow}>
          <button
            type="button"
            onClick={() => setSourceMode('inline')}
            style={sourceMode === 'inline' ? styles.tabActive : styles.tab}
          >
            Inline
          </button>
          <button
            type="button"
            onClick={() => setSourceMode('capture')}
            style={sourceMode === 'capture' ? styles.tabActive : styles.tab}
          >
            Browser capture
          </button>
        </div>

        <div style={styles.label}>{isCapture ? 'HTML or URL' : 'HTML'}</div>
        <textarea
          spellCheck={false}
          value={html}
          onChange={(event) => setHtml(event.target.value)}
          style={styles.textarea}
        />

        {isCapture ? (
          <div style={styles.captureControls}>
            <select
              value={captureMode}
              onChange={(event) => setCaptureMode(event.target.value as CaptureMode)}
              style={styles.select}
            >
              <option value="reconstruct">Reconstruct</option>
              <option value="faithful">Faithful</option>
            </select>
            <button
              type="button"
              onClick={() => void runCapture()}
              disabled={loading}
              style={styles.captureButton}
            >
              {loading ? 'Capturing…' : 'Capture'}
            </button>
          </div>
        ) : null}

        {error ? <div style={styles.error}>{error}</div> : null}

        <div style={styles.label}>Generated TSX</div>
        <pre style={styles.code}>{tsx}</pre>

        <div style={styles.saveRow}>
          <input
            value={docName}
            onChange={(event) => setDocName(event.target.value)}
            placeholder="document name"
            style={styles.nameInput}
          />
          <button
            type="button"
            onClick={() => void saveDoc()}
            disabled={!tsx}
            style={styles.saveButton}
          >
            Save to pdf/
          </button>
        </div>
        {saveMessage ? <div style={styles.saveMessage}>{saveMessage}</div> : null}
      </div>
      <div style={styles.preview}>
        <PDFViewer className="viewer" width="100%" height="100%" showToolbar>
          <MigratedDocument nodes={ir} />
        </PDFViewer>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    flex: 1,
    display: 'flex',
    minWidth: 0,
  },
  left: {
    width: 420,
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
  label: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#6b7280',
  },
  toggleRow: {
    display: 'flex',
    gap: 2,
    background: '#f3f4f6',
    borderRadius: 6,
    padding: 2,
  },
  tab: {
    flex: 1,
    appearance: 'none',
    border: 'none',
    background: 'none',
    fontSize: 12,
    padding: '5px 8px',
    borderRadius: 4,
    color: '#6b7280',
    cursor: 'pointer',
  },
  tabActive: {
    flex: 1,
    appearance: 'none',
    border: 'none',
    background: '#ffffff',
    fontSize: 12,
    fontWeight: 600,
    padding: '5px 8px',
    borderRadius: 4,
    color: '#111827',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
  },
  captureControls: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  select: {
    flex: 1,
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    padding: '6px 8px',
    fontSize: 12,
    color: '#111827',
    background: '#ffffff',
  },
  captureButton: {
    appearance: 'none',
    border: 'none',
    background: '#2563eb',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 600,
    padding: '7px 14px',
    borderRadius: 6,
    cursor: 'pointer',
  },
  error: {
    fontSize: 11,
    color: '#ef4444',
  },
  saveRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  nameInput: {
    flex: 1,
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    padding: '6px 8px',
    fontSize: 12,
    color: '#111827',
    outline: 'none',
  },
  saveButton: {
    appearance: 'none',
    border: '1px solid #d1d5db',
    background: '#ffffff',
    color: '#111827',
    fontSize: 12,
    fontWeight: 600,
    padding: '6px 12px',
    borderRadius: 6,
    cursor: 'pointer',
  },
  saveMessage: {
    fontSize: 11,
    color: '#059669',
  },
  textarea: {
    height: 200,
    resize: 'vertical',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    padding: 10,
    fontSize: 12,
    lineHeight: 1.5,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    color: '#111827',
    outline: 'none',
  },
  code: {
    flex: 1,
    margin: 0,
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    padding: 10,
    fontSize: 11,
    lineHeight: 1.5,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    color: '#111827',
    background: '#f9fafb',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
  },
  preview: {
    flex: 1,
    minWidth: 0,
    background: '#525659',
  },
}
