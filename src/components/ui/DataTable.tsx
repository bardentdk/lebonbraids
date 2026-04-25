'use client';

import { ReactNode, useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Skeleton } from './Skeleton';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyState?: ReactNode;
  onRowClick?: (row: T) => void;
  rowKey: (row: T) => string;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
}

export function DataTable<T>({
  data,
  columns,
  loading,
  emptyState,
  onRowClick,
  rowKey,
  sortKey,
  sortDirection,
  onSort,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-background">
        <div className="space-y-2 p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                    col.sortable && 'cursor-pointer select-none transition-colors hover:text-foreground'
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <div
                    className={cn(
                      'inline-flex items-center gap-1.5',
                      col.align === 'right' && 'justify-end',
                      col.align === 'center' && 'justify-center'
                    )}
                  >
                    {col.label}
                    {col.sortable && (
                      <span className="text-muted-foreground/60">
                        {sortKey !== col.key ? (
                          <ChevronsUpDown className="h-3.5 w-3.5" />
                        ) : sortDirection === 'asc' ? (
                          <ChevronUp className="h-3.5 w-3.5 text-primary-600" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-primary-600" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-b border-border last:border-0 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-muted/30'
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3 align-middle',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right'
                    )}
                  >
                    {col.render
                      ? col.render(row)
                      : ((row as Record<string, ReactNode>)[col.key] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}