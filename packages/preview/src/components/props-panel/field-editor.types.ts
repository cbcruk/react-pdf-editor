export interface FieldEditorProps {
  name: string;
  value: unknown;
  onChange: (next: unknown) => void;
}
