import { ReactNode } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import EmptyState from "./EmptyState";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  width?: string | number;
  render?: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onSortChange?: (key: string) => void;
  /** Zero-based current page, matching MUI's TablePagination convention. */
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  rowsPerPageOptions?: number[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

/**
 * Domain-agnostic data table built on MUI Table primitives. Callers supply
 * column definitions (with optional custom renderers) and own all row data
 * — this component has no knowledge of what a "row" represents.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  sortBy,
  sortDir = "asc",
  onSortChange,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  rowsPerPageOptions = [10, 25, 50],
  loading = false,
  emptyMessage = "No records found.",
  onRowClick,
}: DataTableProps<T>) {
  const handleSort = (key: string) => {
    if (onSortChange) onSortChange(key);
  };

  const showEmpty = !loading && rows.length === 0;

  return (
    <Paper variant="outlined" className="w-full">
      <TableContainer sx={{ maxHeight: "70vh" }}>
        <Table stickyHeader size="medium">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align ?? "left"}
                  style={{ width: column.width }}
                  sortDirection={sortBy === column.key ? sortDir : false}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortBy === column.key}
                      direction={sortBy === column.key ? sortDir : "asc"}
                      onClick={() => handleSort(column.key)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            )}
            {showEmpty && (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ py: 6, border: 0 }}>
                  <EmptyState message={emptyMessage} />
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              rows.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  hover={Boolean(onRowClick)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={onRowClick ? { cursor: "pointer" } : undefined}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} align={column.align ?? "left"}>
                      {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ borderTop: 1, borderColor: "divider" }}>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_event, newPage) => onPageChange(newPage)}
          rowsPerPage={limit}
          onRowsPerPageChange={
            onLimitChange ? (event) => onLimitChange(parseInt(event.target.value, 10)) : undefined
          }
          rowsPerPageOptions={onLimitChange ? rowsPerPageOptions : []}
        />
      </Box>
    </Paper>
  );
}

export default DataTable;
