import { View } from "@react-pdf/renderer";
import { Heading } from "../heading/heading.tsx";
import { mergeStyles } from "../style.utils.ts";
import { useTokens } from "../theme.tsx";
import type { SectionProps } from "./section.types.ts";

export function Section({ children, title, style }: SectionProps): React.ReactElement {
  const tokens = useTokens();

  return (
    <View style={mergeStyles({ marginBottom: tokens.space.md }, style)}>
      {title ? <Heading level={2}>{title}</Heading> : null}
      {children}
    </View>
  );
}
