import { Text } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import { mergeStyles } from "../style.utils.ts";
import { useTokens } from "../theme.tsx";
import type { HeadingProps } from "./heading.types.ts";

export function Heading({ children, level = 2, style }: HeadingProps): React.ReactElement {
  const tokens = useTokens();

  const levelStyle: Record<NonNullable<HeadingProps["level"]>, Style> = {
    1: { fontSize: tokens.fontSize.xl, marginBottom: tokens.space.xs },
    2: { fontSize: tokens.fontSize.md, marginBottom: tokens.space.sm },
    3: { fontSize: tokens.fontSize.base, marginBottom: tokens.space.xs },
  };

  return (
    <Text
      style={mergeStyles(
        {
          fontFamily: tokens.fontFamily,
          fontWeight: tokens.fontWeight.bold,
          color: tokens.color.text,
        },
        levelStyle[level],
        style,
      )}
    >
      {children}
    </Text>
  );
}
