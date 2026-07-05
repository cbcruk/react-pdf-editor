import type { ReactNode } from 'react'
import type { Style } from '@react-pdf/types'

export interface SectionProps {
  children: ReactNode
  title?: string
  style?: Style | Style[]
}
