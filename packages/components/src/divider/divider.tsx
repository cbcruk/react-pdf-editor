import { View } from '@react-pdf/renderer'
import { mergeStyles } from '../style.utils.ts'
import { useTokens } from '../theme.tsx'
import type { DividerProps } from './divider.types.ts'

export function Divider({ style }: DividerProps): React.ReactElement {
  const tokens = useTokens()

  return (
    <View
      style={mergeStyles(
        {
          borderBottomWidth: 1,
          borderColor: tokens.color.border,
          marginVertical: tokens.space.md,
        },
        style,
      )}
    />
  )
}
