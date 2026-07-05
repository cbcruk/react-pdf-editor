import type { ReactNode } from 'react'
import type { Style } from '@react-pdf/types'

export interface HeadingProps {
  children: ReactNode
  level?: 1 | 2 | 3
  style?: Style | Style[]
}
