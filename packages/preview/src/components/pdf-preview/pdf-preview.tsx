import { useEffect, useRef, useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { PdfPreviewProps } from './pdf-preview.types.ts'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

interface RenderToken {
  cancelled: boolean
}

async function renderToContainer(
  blob: Blob,
  container: HTMLDivElement,
  token: RenderToken,
): Promise<void> {
  const data = await blob.arrayBuffer()
  if (token.cancelled) {
    return
  }

  const loadingTask = pdfjs.getDocument({ data })
  const pdf = await loadingTask.promise
  if (token.cancelled) {
    void loadingTask.destroy()
    return
  }

  const ratio = window.devicePixelRatio || 1
  const targetWidth = Math.max(320, container.clientWidth - 48)
  const canvases: HTMLCanvasElement[] = []

  for (let index = 1; index <= pdf.numPages; index += 1) {
    const page = await pdf.getPage(index)
    if (token.cancelled) {
      void loadingTask.destroy()
      return
    }

    const base = page.getViewport({ scale: 1 })
    const viewport = page.getViewport({ scale: (targetWidth / base.width) * ratio })

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    canvas.style.width = `${viewport.width / ratio}px`
    canvas.style.height = `${viewport.height / ratio}px`
    canvas.style.display = 'block'
    canvas.style.margin = '0 auto 16px'
    canvas.style.background = '#ffffff'
    canvas.style.boxShadow = '0 1px 6px rgba(0, 0, 0, 0.3)'

    const context = canvas.getContext('2d')
    if (context) {
      await page.render({ canvas, canvasContext: context, viewport }).promise
    }

    canvases.push(canvas)
  }

  if (token.cancelled) {
    void loadingTask.destroy()
    return
  }

  container.replaceChildren(...canvases)
  void loadingTask.destroy()
}

export function PdfPreview({
  document: doc,
  debounceMs = 250,
  background = '#525659',
}: PdfPreviewProps): React.ReactElement {
  const [debounced, setDebounced] = useState(doc)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(doc), debounceMs)
    return () => clearTimeout(timer)
  }, [doc, debounceMs])

  const [blob, setBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    pdf(debounced)
      .toBlob()
      .then(
        (next) => {
          if (!cancelled) {
            setBlob(next)
            setError(null)
          }
        },
        (cause: unknown) => {
          if (!cancelled) {
            setError(cause instanceof Error ? cause.message : String(cause))
          }
        },
      )

    return () => {
      cancelled = true
    }
  }, [debounced])

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !blob) {
      return
    }

    const token: RenderToken = { cancelled: false }
    void renderToContainer(blob, container, token)

    return () => {
      token.cancelled = true
    }
  }, [blob])

  return (
    <div style={{ ...styles.wrap, background }}>
      {error ? <div style={styles.error}>{error}</div> : null}
      <div ref={containerRef} style={styles.canvasArea} />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  canvasArea: {
    flex: 1,
    overflow: 'auto',
    padding: 24,
    boxSizing: 'border-box',
  },
  error: {
    padding: '8px 12px',
    background: '#7f1d1d',
    color: '#fecaca',
    fontSize: 12,
  },
}
