import { Text, View } from '@react-pdf/renderer'
import { useTokens } from '../theme.tsx'
import type { KeyValueProps } from './key-value.types.ts'

export function KeyValue({ label, value }: KeyValueProps): React.ReactElement {
  const tokens = useTokens()

  return (
    <View style={{ marginBottom: tokens.space.sm, fontFamily: tokens.fontFamily }}>
      <Text
        style={{
          fontSize: tokens.fontSize.sm,
          color: tokens.color.muted,
          marginBottom: 2,
        }}
      >
        {label}
      </Text>
      <Text style={{ fontSize: tokens.fontSize.base, color: tokens.color.text }}>{value}</Text>
    </View>
  )
}
