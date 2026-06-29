import type { Tokens } from "../tokens.ts";

export type SpacerSize = keyof Tokens["space"] | number;

export interface SpacerProps {
  size?: SpacerSize;
}
