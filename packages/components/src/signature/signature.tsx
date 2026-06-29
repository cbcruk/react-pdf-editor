import { Text, View } from "@react-pdf/renderer";
import { useTokens } from "../theme.tsx";
import type { SignatureProps } from "./signature.types.ts";

export function Signature({ label, width = "45%" }: SignatureProps): React.ReactElement {
  const tokens = useTokens();

  return (
    <View style={{ width }}>
      <Text
        style={{
          borderTopWidth: 1,
          borderColor: tokens.color.borderStrong,
          marginTop: tokens.space.xl,
          paddingTop: tokens.space.xs,
          fontFamily: tokens.fontFamily,
          fontSize: tokens.fontSize.sm,
          color: tokens.color.muted,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
