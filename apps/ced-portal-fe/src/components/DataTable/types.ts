import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';

export type SortDirection = 'asc' | 'desc';

export interface DataTableColumn<T> {
  id: string;
  label: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  hideBreakpoint?: Record<string, string>;
  sortable?: boolean;
  sortAccessor?: (item: T) => string | number;
  renderCell: (item: T) => ReactNode;
}

export interface DataTableRowAction<T> {
  renderAction: (item: T) => ReactNode;
  width?: number;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  items: T[];
  getRowKey: (item: T) => string;
  rowAction?: DataTableRowAction<T>;
  hideWhenEmpty?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyMessage?: string;
  sx?: SxProps<Theme>;
}
