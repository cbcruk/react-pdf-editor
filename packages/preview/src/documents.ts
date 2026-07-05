import type { ComponentType } from 'react'
import type { PdfDocument } from './documents.types.ts'

interface PdfModule {
  default: ComponentType<Record<string, unknown>>
  previewProps?: Record<string, unknown>
}

const modules = import.meta.glob('../pdf/*.tsx', {
  eager: true,
}) as Record<string, PdfModule>

export const documents: PdfDocument[] = Object.entries(modules)
  .map(([path, mod]): PdfDocument => {
    const file = path.split('/').pop() ?? path
    const slug = file.replace(/\.tsx$/, '')

    return {
      slug,
      Component: mod.default,
      previewProps: mod.previewProps ?? {},
    }
  })
  .sort((a, b) => a.slug.localeCompare(b.slug))
