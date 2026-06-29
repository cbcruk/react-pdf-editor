import { View } from "@react-pdf/renderer";
import { useTokens } from "../theme.tsx";
import type { SpacerProps } from "./spacer.types.ts";

export function Spacer({ size = "md" }: SpacerProps): React.ReactElement {
  const tokens = useTokens();
  const height = typeof size === "number" ? size : tokens.space[size];

  return <View style={{ height }} />;
}
