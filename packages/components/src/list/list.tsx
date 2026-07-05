import { Text, View } from '@react-pdf/renderer'
import { mergeStyles } from '../style.utils.ts'
import { useTokens } from '../theme.tsx'
import type { ListProps } from './list.types.ts'

export function List({ items, ordered = false, style }: ListProps): React.ReactElement {
  const tokens = useTokens()

  return (
    <View
      style={mergeStyles(
        {
          fontFamily: tokens.fontFamily,
          fontSize: tokens.fontSize.base,
          color: tokens.color.text,
        },
        style,
      )}
    >
      {items.map((item, index) => (
        <View key={index} style={{ flexDirection: 'row', marginBottom: tokens.space.xs }}>
          <Text style={{ width: 18, color: tokens.color.muted }}>
            {ordered ? `${index + 1}.` : '•'}
          </Text>
          <Text style={{ flex: 1 }}>{item}</Text>
        </View>
      ))}
    </View>
  )
}
