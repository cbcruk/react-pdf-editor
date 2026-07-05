import type { PdfDocument } from '../../documents.types.ts'

export interface SidebarProps {
  documents: PdfDocument[]
  activeSlug: string
  onSelect: (slug: string) => void
  migrateActive: boolean
  onMigrate: () => void
  builderActive: boolean
  onBuilder: () => void
}
