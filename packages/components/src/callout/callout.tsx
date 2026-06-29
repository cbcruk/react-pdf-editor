import { Text, View } from "@react-pdf/renderer";
import { useTokens } from "../theme.tsx";
import type { CalloutProps, CalloutVariant } from "./callout.types.ts";

const variantColor: Record<CalloutVariant, { accent: string; background: string }> = {
  info: { accent: "#2563eb", background: "#eff6ff" },
  warning: { accent: "#d97706", background: "#fffbeb" },
};

export function Callout({ children, title, variant = "info" }: CalloutProps): React.ReactElement {
  const tokens = useTokens();
  const { accent, background } = variantColor[variant];

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: background,
        borderLeftWidth: 3,
        borderLeftColor: accent,
        borderRadius: tokens.radius.sm,
        padding: tokens.space.md,
        marginBottom: tokens.space.md,
        fontFamily: tokens.fontFamily,
        fontSize: tokens.fontSize.base,
        color: tokens.color.text,
      }}
    >
      <View style={{ flex: 1 }}>
        {title ? (
          <Text
            style={{
              fontWeight: tokens.fontWeight.bold,
              color: accent,
              marginBottom: tokens.space.xs,
            }}
          >
            {title}
          </Text>
        ) : null}
        <Text>{children}</Text>
      </View>
    </View>
  );
}
