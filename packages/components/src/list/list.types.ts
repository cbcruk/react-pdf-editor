import type { Style } from "@react-pdf/types";

export interface ListProps {
  items: string[];
  ordered?: boolean;
  style?: Style | Style[];
}
