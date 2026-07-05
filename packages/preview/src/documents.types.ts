import type { ComponentType } from 'react'

export interface PdfDocument {
  slug: string
  Component: ComponentType<Record<string, unknown>>
  previewProps: Record<string, unknown>
}
