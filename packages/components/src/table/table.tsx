import { Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import { useTokens } from "../theme.tsx";
import type { TableColumn, TableProps } from "./table.types.ts";

export function Table({ columns, data }: TableProps): React.ReactElement {
  const tokens = useTokens();

  const cellStyle = (column: TableColumn): Style => ({
    width: column.width,
    flex: column.width === undefined ? 1 : undefined,
    textAlign: column.align ?? "left",
    paddingRight: tokens.space.sm,
  });

  return (
    <View
      style={{
        fontFamily: tokens.fontFamily,
        fontSize: tokens.fontSize.base,
        color: tokens.color.text,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          borderBottomWidth: 2,
          borderColor: tokens.color.borderStrong,
          paddingVertical: tokens.space.sm,
          fontWeight: tokens.fontWeight.bold,
        }}
      >
        {columns.map((column) => (
          <Text key={column.key} style={cellStyle(column)}>
            {column.header}
          </Text>
        ))}
      </View>

      {data.map((row, index) => (
        <View
          key={index}
          style={{
            flexDirection: "row",
            borderBottomWidth: 1,
            borderColor: tokens.color.border,
            paddingVertical: tokens.space.sm,
          }}
        >
          {columns.map((column) => (
            <Text key={column.key} style={cellStyle(column)}>
              {row[column.key] ?? ""}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}
