import { PDFDownloadLink } from '@react-pdf/renderer'
import type { ToolbarProps } from './toolbar.types.ts'

export function Toolbar({
  title,
  document,
  fileName,
  surface,
  onToggleSurface,
}: ToolbarProps): React.ReactElement {
  return (
    <header style={styles.bar}>
      <span style={styles.title}>{title}</span>
      <div style={styles.actions}>
        <button type="button" onClick={onToggleSurface} style={styles.surfaceButton}>
          {surface === 'dark' ? '밝은 배경' : '어두운 배경'}
        </button>
        <PDFDownloadLink document={document} fileName={fileName} style={styles.link}>
          {({ loading }) => (loading ? '생성 중…' : 'PDF 다운로드')}
        </PDFDownloadLink>
      </div>
    </header>
  )
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    flexShrink: 0,
    padding: '0 16px',
    borderBottom: '1px solid #e5e7eb',
    background: '#ffffff',
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: '#111827',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  surfaceButton: {
    appearance: 'none',
    border: '1px solid #d1d5db',
    background: '#ffffff',
    color: '#374151',
    fontSize: 12,
    padding: '6px 10px',
    borderRadius: 6,
    cursor: 'pointer',
  },
  link: {
    fontSize: 12,
    fontWeight: 600,
    color: '#ffffff',
    background: '#2563eb',
    padding: '6px 12px',
    borderRadius: 6,
    textDecoration: 'none',
  },
}
