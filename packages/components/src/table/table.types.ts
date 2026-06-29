export interface TableColumn {
  key: string;
  header: string;
  width?: number | string;
  align?: "left" | "right" | "center";
}

export interface TableProps {
  columns: TableColumn[];
  data: Array<Record<string, string>>;
}
