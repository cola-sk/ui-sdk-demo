import * as React from "react";

export interface TableColumn<T> {
  key: string;
  title: React.ReactNode;
  width?: string;
  render: (row: T) => React.ReactNode;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  emptyText?: string;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  rowKey,
  emptyText = "暂无数据",
  className = "",
}: TableProps<T>) {
  return (
    <div
      className={`w-full overflow-x-auto rounded-card border border-border bg-surface ${className}`}
    >
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border-light bg-subtle/60">
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className="px-4 py-3 text-[13px] font-medium text-ink-secondary whitespace-nowrap"
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-sm text-ink-muted"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={rowKey(row)}
                className="h-[57px] border-b border-border-light last:border-b-0 hover:bg-page/60 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2.5 text-sm text-ink align-middle">
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
