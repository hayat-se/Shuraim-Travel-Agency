import React from 'react';
import { cn } from './cn';
import EmptyState from './EmptyState';
import Skeleton from './Skeleton';

/**
 * Data table.
 *   columns: [{ key, header, render?(row), className?, align? }]
 *   data:    array of row objects
 * Handles loading (skeleton rows) and empty states, and scrolls horizontally on mobile.
 */
export default function Table({
  columns,
  data,
  loading,
  rowKey = 'id',
  emptyTitle = 'No records',
  emptyMessage,
  onRowClick,
  stickyHeader = false,
  dense = true,
  className,
}) {
  const align = { left: 'text-left', center: 'text-center', right: 'text-right' };
  const cellPad = dense ? 'px-3 py-2' : 'px-4 py-3';

  return (
    <div className={cn('w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card', className)}>
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className={cn('border-b border-neutral-200 bg-gradient-header', stickyHeader && 'sticky top-0 z-10')}>
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={cn(
                    'whitespace-nowrap px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-primary-800',
                    align[c.align] || 'text-left'
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-neutral-100">
                  {columns.map((c) => (
                    <td key={c.key} className={cellPad}>
                      <Skeleton className="h-4 w-full max-w-[160px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : !data || data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10">
                  <EmptyState title={emptyTitle} message={emptyMessage} />
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row[rowKey] ?? idx}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'border-b border-neutral-100 transition-all duration-150 ease-premium last:border-0',
                    'hover:bg-primary-50/60 hover:shadow-row-active',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(cellPad, 'text-neutral-800', align[c.align] || 'text-left', c.className)}
                    >
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
