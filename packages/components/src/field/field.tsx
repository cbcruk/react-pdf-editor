import { Text, View } from "@react-pdf/renderer";
import { useTokens } from "../theme.tsx";
import type { FieldProps } from "./field.types.ts";

export function Field({ label, value, children }: FieldProps): React.ReactElement {
  const tokens = useTokens();

  return (
    <View
      style={{
        flexDirection: "row",
        marginBottom: tokens.space.xs,
        fontFamily: tokens.fontFamily,
        fontSize: tokens.fontSize.base,
      }}
    >
      <Text
        style={{
          width: 96,
          color: tokens.color.muted,
        }}
      >
        {label}
      </Text>
      <Text style={{ flex: 1, color: tokens.color.text }}>{value ?? children}</Text>
    </View>
  );
}
