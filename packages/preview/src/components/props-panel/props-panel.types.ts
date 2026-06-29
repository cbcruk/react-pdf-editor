export interface PropsPanelProps {
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}
