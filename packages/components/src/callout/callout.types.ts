import type { ReactNode } from 'react'

export type CalloutVariant = 'info' | 'warning'

export interface CalloutProps {
  children: ReactNode
  title?: string
  variant?: CalloutVariant
}
