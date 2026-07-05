import type { ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'

export type Surface = 'dark' | 'light'

export interface ToolbarProps {
  title: string
  document: ReactElement<DocumentProps>
  fileName: string
  surface: Surface
  onToggleSurface: () => void
}
