import type { ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'

export interface PdfPreviewProps {
  document: ReactElement<DocumentProps>
  debounceMs?: number
  background?: string
}
